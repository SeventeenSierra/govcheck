# SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
# SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

"""
Strands Python service for AI-powered compliance analysis.

This FastAPI service provides document analysis capabilities using AWS Bedrock
for compliance checking against FAR/DFARS regulations.
"""

import os
import uuid
from contextlib import asynccontextmanager
from typing import Dict, Any
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, Path, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from config import get_settings
from logging_config import setup_logging, get_logger
from models import (
    AnalysisStartRequest,
    AnalysisStartResponse,
    AnalysisStatusResponse,
    AnalysisResultsResponse,
    ComplianceResults,
    ComplianceIssue,
    ComplianceSummary,
    RegulatoryReference,
    ErrorResponse,
    HealthCheckResponse
)
from database import init_database, check_database_health, close_database_connections
from db_operations import (
    create_analysis_session,
    get_analysis_session,
    update_analysis_progress,
    store_compliance_results,
    get_compliance_results
)
from db_models import AnalysisStatus
from concurrent_processor import (
    get_processor, 
    processor_lifespan,
    submit_analysis_task,
    get_processing_status,
    cancel_analysis_task
)

# Initialize configuration and logging
settings = get_settings()
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    logger.info("Starting Strands service...")
    
    # Startup logic
    try:
        # Validate environment configuration
        validate_environment()
        logger.info("Environment validation completed")
        
        # Initialize database
        try:
            await init_database()
            logger.info("Database initialization completed")
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            raise
        
        # Initialize database seeding
        try:
            from seed_manager import initialize_seeding
            await initialize_seeding()
            logger.info("Database seeding initialization completed")
        except Exception as e:
            logger.error(f"Database seeding initialization failed: {e}")
            # Don't fail startup - seeding is not critical for service operation
            logger.warning("Continuing without seeding initialization")
        
        # Initialize AWS Bedrock and PDF processing services
        try:
            from aws_bedrock import get_bedrock_client
            from pdf_processor import get_pdf_processor
            from fallback_analysis import get_fallback_service
            
            # Initialize services
            bedrock_client = get_bedrock_client()
            pdf_processor = get_pdf_processor()
            fallback_service = get_fallback_service()
            
            # Log service availability
            if bedrock_client.is_available():
                logger.info("AWS Bedrock client initialized and available")
            else:
                logger.warning("AWS Bedrock client not available - using fallback analysis")
            
            if pdf_processor._s3_client:
                logger.info("PDF processor with S3 client initialized")
            else:
                logger.warning("PDF processor S3 client not available")
            
            logger.info("Fallback analysis service initialized")
            logger.info("All analysis services initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize analysis services: {e}")
            # Don't fail startup - services can still work with fallback
            logger.warning("Continuing with limited functionality")
        
        # Initialize concurrent processor
        try:
            async with processor_lifespan() as processor:
                logger.info("Concurrent processor initialized successfully")
                yield
        except Exception as e:
            logger.error(f"Failed to initialize concurrent processor: {e}")
            raise
        
    except Exception as e:
        logger.error(f"Failed to start Strands service: {e}")
        raise
    finally:
        # Shutdown logic
        logger.info("Shutting down Strands service...")
        try:
            await close_database_connections()
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")


async def process_analysis(session_id: str) -> None:
    """
    Background task to process document analysis using AWS Bedrock AI.
    
    This function orchestrates the complete analysis pipeline:
    1. Extract text from PDF document stored in S3/MinIO
    2. Analyze document using AWS Bedrock AI services
    3. Fall back to mock analysis if AI services are unavailable
    4. Store results and update session status
    
    Args:
        session_id: Unique identifier for the analysis session
    """
    from pdf_processor import get_pdf_processor
    from aws_bedrock import get_bedrock_client
    from fallback_analysis import get_fallback_service
    import asyncio
    import time
    
    start_time = time.time()
    
    # Get session data from database
    session_data = await get_analysis_session(session_id)
    if not session_data:
        logger.error(f"Analysis session {session_id} not found in database")
        return
    
    try:
        logger.info(f"Starting real AI analysis for session {session_id}")
        
        # Phase 1: Document text extraction
        await update_analysis_progress(
            session_id=session_id,
            status=AnalysisStatus.EXTRACTING,
            progress=10.0,
            current_step="Extracting text from PDF document"
        )
        
        pdf_processor = get_pdf_processor()
        document_text, pdf_metadata = await pdf_processor.extract_text_from_s3(
            s3_key=session_data["s3_key"]
        )
        
        logger.info(f"Extracted {len(document_text)} characters from document {session_data['document_id']}")
        
        # Update progress
        await update_analysis_progress(
            session_id=session_id,
            status=AnalysisStatus.EXTRACTING,
            progress=30.0,
            current_step="Document text extracted successfully"
        )
        await asyncio.sleep(0.5)  # Brief pause for progress update
        
        # Phase 2: AI Analysis
        await update_analysis_progress(
            session_id=session_id,
            status=AnalysisStatus.ANALYZING,
            progress=40.0,
            current_step="Analyzing document for compliance issues using AI"
        )
        
        bedrock_client = get_bedrock_client()
        results = None
        
        # Try AWS Bedrock first
        if bedrock_client.is_available():
            try:
                logger.info(f"Using AWS Bedrock for analysis of document {session_data['document_id']}")
                await update_analysis_progress(
                    session_id=session_id,
                    status=AnalysisStatus.ANALYZING,
                    progress=60.0,
                    current_step="Processing with AWS Bedrock AI"
                )
                
                results = await bedrock_client.analyze_document(
                    document_text=document_text,
                    filename=session_data["filename"],
                    document_id=session_data["document_id"]
                )
                
                logger.info(f"AWS Bedrock analysis completed for document {session_data['document_id']}")
                
            except Exception as bedrock_error:
                logger.warning(f"AWS Bedrock analysis failed for document {session_data['document_id']}: {bedrock_error}")
                results = None  # Will trigger fallback
        
        # Fallback to mock analysis if Bedrock failed or unavailable
        if results is None:
            logger.info(f"Using fallback analysis for document {session_data['document_id']}")
            await update_analysis_progress(
                session_id=session_id,
                status=AnalysisStatus.ANALYZING,
                progress=70.0,
                current_step="Processing with fallback analysis service"
            )
            
            fallback_service = get_fallback_service()
            results = await fallback_service.generate_mock_analysis(
                document_text=document_text,
                filename=session_data["filename"],
                document_id=session_data["document_id"],
                session_id=session_id
            )
        
        # Phase 3: Finalize results
        await update_analysis_progress(
            session_id=session_id,
            status=AnalysisStatus.ANALYZING,
            progress=90.0,
            current_step="Finalizing compliance report"
        )
        
        # Calculate processing time
        processing_time = time.time() - start_time
        results.processing_time = processing_time
        results.session_id = session_id
        
        # Add PDF metadata to results
        results.metadata.update({
            "pdf_metadata": pdf_metadata,
            "text_extraction_successful": True,
            "document_text_length": len(document_text)
        })
        
        # Store results in database
        await store_compliance_results(results)
        
        # Update session as completed
        await update_analysis_progress(
            session_id=session_id,
            status=AnalysisStatus.COMPLETED,
            progress=100.0,
            current_step="Analysis completed successfully"
        )
        
        logger.info(f"Completed analysis for session {session_id} in {processing_time:.2f} seconds")
        
    except Exception as e:
        logger.error(f"Analysis failed for session {session_id}: {e}", exc_info=True)
        
        # Update session with error information
        await update_analysis_progress(
            session_id=session_id,
            status=AnalysisStatus.FAILED,
            progress=0.0,
            current_step="Analysis failed",
            error_message=str(e)
        )
        
        # Create error results for consistency
        error_results = ComplianceResults(
            id=f"error_{session_id}_{int(datetime.utcnow().timestamp())}",
            session_id=session_id,
            document_id=session_data.get("document_id", "unknown"),
            status="fail",
            issues=[],
            summary=ComplianceSummary(
                total_issues=0,
                critical_count=0,
                warning_count=0,
                info_count=0,
                overall_score=0.0
            ),
            generated_at=datetime.utcnow(),
            ai_model="error",
            processing_time=time.time() - start_time,
            metadata={
                "error": str(e),
                "analysis_failed": True
            }
        )
        
        # Store error results in database
        try:
            await store_compliance_results(error_results)
        except Exception as store_error:
            logger.error(f"Failed to store error results for session {session_id}: {store_error}")


def validate_environment() -> None:
    """Validate required environment variables and configuration."""
    logger.info(f"Validating environment configuration for: {settings.environment}")
    
    # Log current configuration (without sensitive data)
    logger.info(f"Service will run on {settings.host}:{settings.port}")
    logger.info(f"AWS Region: {settings.aws_region}")
    logger.info(f"Bedrock Model ID: {settings.bedrock_model_id}")
    logger.info(f"Database URL configured: {bool(settings.database_url)}")
    logger.info(f"Redis URL configured: {bool(settings.redis_url)}")
    logger.info(f"S3 Endpoint: {settings.s3_endpoint_url}")
    logger.info(f"S3 Bucket: {settings.s3_bucket_name}")
    
    # Check for AWS credentials in production
    if settings.environment == "production":
        if not settings.aws_access_key_id or not settings.aws_secret_access_key:
            logger.warning("AWS credentials not found - will use fallback analysis only")
        else:
            logger.info("AWS credentials configured for Bedrock access")
    else:
        # In development, AWS credentials are optional
        if settings.aws_access_key_id and settings.aws_secret_access_key:
            logger.info("AWS credentials configured for development")
        else:
            logger.info("No AWS credentials - will use fallback analysis only")
    
    # Validate S3 configuration
    if not settings.s3_endpoint_url:
        logger.warning("S3 endpoint not configured - document retrieval may fail")
    
    logger.info("Environment validation completed successfully")


# Create FastAPI application
app = FastAPI(
    title="Strands Compliance Analysis Service",
    description="AI-powered document analysis for regulatory compliance",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://web:3000",
        settings.web_service_url
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthCheckResponse)
async def health_check() -> HealthCheckResponse:
    """
    Health check endpoint for container orchestration.
    
    Returns:
        HealthCheckResponse containing service status and system information
    """
    try:
        checks = {
            "service": "ok",
            "logging": "ok",
            "configuration": "ok"
        }
        
        # Add database check
        try:
            db_health = await check_database_health()
            checks.update(db_health)
        except Exception as e:
            logger.warning(f"Database health check failed: {e}")
            checks["database"] = "error"
            
        # Add AWS services check
        try:
            from aws_bedrock import get_bedrock_client
            bedrock_client = get_bedrock_client()
            if bedrock_client.is_available():
                checks["aws_bedrock"] = "ok"
            else:
                checks["aws_bedrock"] = "warning"
                logger.warning("AWS Bedrock client not available - will use fallback analysis")
        except Exception as e:
            logger.warning(f"AWS Bedrock health check failed: {e}")
            checks["aws_bedrock"] = "warning"
        
        # Add S3/MinIO connectivity check
        try:
            from pdf_processor import get_pdf_processor
            pdf_processor = get_pdf_processor()
            if pdf_processor._s3_client:
                checks["s3_storage"] = "ok"
            else:
                checks["s3_storage"] = "warning"
        except Exception as e:
            logger.warning(f"S3 storage health check failed: {e}")
            checks["s3_storage"] = "warning"
        
        # Add concurrent processor check
        try:
            processor_status = await get_processing_status()
            if processor_status["max_workers"] > 0:
                checks["concurrent_processor"] = "ok"
                checks["queue_size"] = processor_status["queue_size"]
                checks["active_tasks"] = processor_status["active_tasks"]
            else:
                checks["concurrent_processor"] = "warning"
        except Exception as e:
            logger.warning(f"Concurrent processor health check failed: {e}")
            checks["concurrent_processor"] = "warning"
        
        # Determine overall status
        status = "healthy"
        if any(check == "warning" for check in checks.values()):
            status = "degraded"
        elif any(check == "error" for check in checks.values()):
            status = "unhealthy"
            
        logger.info("Health check completed successfully")
        return HealthCheckResponse(
            status=status,
            version="1.0.0",
            environment=settings.environment,
            checks=checks
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")


@app.post("/api/analysis/start", response_model=AnalysisStartResponse)
async def start_analysis(
    request: AnalysisStartRequest
) -> AnalysisStartResponse:
    """
    Start document analysis for compliance checking using concurrent processing.
    
    Args:
        request: Analysis request containing document information
        
    Returns:
        AnalysisStartResponse with session ID and initial status
    """
    try:
        # Create analysis session in database
        session_id = await create_analysis_session(request)
        
        # Submit task to concurrent processor
        queued = await submit_analysis_task(session_id, request)
        
        if not queued:
            raise HTTPException(
                status_code=503,
                detail="Analysis queue is full, please try again later"
            )
        
        logger.info(f"Queued analysis session {session_id} for document {request.document_id}")
        
        return AnalysisStartResponse(
            success=True,
            session_id=session_id,
            status="queued",
            estimated_completion=datetime.utcnow() + timedelta(minutes=5),
            message=f"Analysis queued for document {request.filename}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start analysis: {str(e)}"
        )


@app.get("/api/analysis/{session_id}", response_model=AnalysisStatusResponse)
async def get_analysis_status(
    session_id: str = Path(..., description="Analysis session ID")
) -> AnalysisStatusResponse:
    """
    Get the current status of an analysis session.
    
    Args:
        session_id: Unique identifier for the analysis session
        
    Returns:
        AnalysisStatusResponse with current status and progress
    """
    try:
        # Get session from database
        session_data = await get_analysis_session(session_id)
        
        if not session_data:
            raise HTTPException(
                status_code=404,
                detail=f"Analysis session {session_id} not found"
            )
        
        logger.info(f"Retrieved status for analysis session {session_id}")
        
        return AnalysisStatusResponse(
            success=True,
            session_id=session_id,
            status=session_data["status"],
            progress=session_data["progress"],
            current_step=session_data["current_step"],
            started_at=session_data["started_at"],
            completed_at=session_data["completed_at"],
            estimated_completion=session_data["estimated_completion"],
            error_message=session_data["error_message"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get analysis status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get analysis status: {str(e)}"
        )


@app.get("/api/analysis/{session_id}/results", response_model=AnalysisResultsResponse)
async def get_analysis_results(
    session_id: str = Path(..., description="Analysis session ID")
) -> AnalysisResultsResponse:
    """
    Get the results of a completed analysis session.
    
    Args:
        session_id: Unique identifier for the analysis session
        
    Returns:
        AnalysisResultsResponse with compliance analysis results
    """
    try:
        # Check if session exists
        session_data = await get_analysis_session(session_id)
        
        if not session_data:
            raise HTTPException(
                status_code=404,
                detail=f"Analysis session {session_id} not found"
            )
        
        # Check if analysis is completed
        if session_data["status"] != "completed":
            return AnalysisResultsResponse(
                success=False,
                results=None,
                message=f"Analysis is not yet completed. Current status: {session_data['status']}"
            )
        
        # Get results from database
        results = await get_compliance_results(session_id)
        
        if not results:
            return AnalysisResultsResponse(
                success=False,
                results=None,
                message="Analysis completed but results not found"
            )
        
        logger.info(f"Retrieved results for analysis session {session_id}")
        
        return AnalysisResultsResponse(
            success=True,
            results=results,
            message="Analysis results retrieved successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get analysis results: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get analysis results: {str(e)}"
        )


@app.get("/api/processing/status")
async def get_processing_status_endpoint() -> Dict[str, Any]:
    """
    Get current processing queue and worker status.
    
    Returns:
        Dict containing processing statistics and worker information
    """
    try:
        status = await get_processing_status()
        logger.debug("Retrieved processing status")
        return {
            "success": True,
            "status": status,
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        logger.error(f"Failed to get processing status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get processing status: {str(e)}"
        )


@app.post("/api/analysis/{session_id}/cancel")
async def cancel_analysis_endpoint(
    session_id: str = Path(..., description="Analysis session ID to cancel")
) -> Dict[str, Any]:
    """
    Cancel a queued or active analysis session.
    
    Args:
        session_id: Session ID to cancel
        
    Returns:
        Dict containing cancellation result
    """
    try:
        cancelled = await cancel_analysis_task(session_id)
        
        if cancelled:
            logger.info(f"Cancelled analysis session {session_id}")
            return {
                "success": True,
                "message": f"Analysis session {session_id} cancelled successfully"
            }
        else:
            return {
                "success": False,
                "message": f"Analysis session {session_id} could not be cancelled (may not exist or already completed)"
            }
            
    except Exception as e:
        logger.error(f"Failed to cancel analysis session {session_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to cancel analysis: {str(e)}"
        )


@app.get("/api/seed/status")
async def get_seeding_status() -> Dict[str, Any]:
    """
    Get current database seeding status.
    
    Returns:
        Dict containing seeding status and document counts
    """
    try:
        from seed_manager import seed_manager
        status = await seed_manager.check_seeding_status()
        
        logger.debug("Retrieved seeding status")
        return {
            "success": True,
            "seeding_status": status,
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        logger.error(f"Failed to get seeding status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get seeding status: {str(e)}"
        )


@app.get("/api/seed/documents")
async def get_seeded_documents() -> Dict[str, Any]:
    """
    Get list of all seeded documents.
    
    Returns:
        Dict containing list of seeded documents with metadata
    """
    try:
        from seed_manager import seed_manager
        documents = await seed_manager.get_seeded_documents()
        
        logger.debug(f"Retrieved {len(documents)} seeded documents")
        return {
            "success": True,
            "documents": documents,
            "count": len(documents),
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        logger.error(f"Failed to get seeded documents: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get seeded documents: {str(e)}"
        )


@app.post("/api/seed/reseed")
async def reseed_database() -> Dict[str, Any]:
    """
    Force reseed the database with document metadata.
    
    Returns:
        Dict containing reseeding results
    """
    try:
        from seed_manager import seed_manager
        result = await seed_manager.seed_database(force_reseed=True)
        
        logger.info(f"Database reseeding completed: {result['message']}")
        return {
            "success": True,
            "result": result,
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        logger.error(f"Failed to reseed database: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reseed database: {str(e)}"
        )


@app.get("/api/seed/verify")
async def verify_seeded_files() -> Dict[str, Any]:
    """
    Verify that all seeded documents have corresponding files.
    
    Returns:
        Dict containing file verification results
    """
    try:
        from seed_manager import seed_manager
        verification = await seed_manager.verify_seeded_files()
        
        logger.debug("File verification completed")
        return {
            "success": True,
            "verification": verification,
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        logger.error(f"Failed to verify seeded files: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to verify seeded files: {str(e)}"
        )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for consistent error responses."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    error_response = ErrorResponse(
        error="Internal server error",
        code="INTERNAL_ERROR",
        request_id=getattr(request.state, 'request_id', 'unknown')
    )
    
    return JSONResponse(
        status_code=500,
        content=error_response.dict()
    )


if __name__ == "__main__":
    logger.info(f"Starting Strands service on {settings.host}:{settings.port}")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Reload enabled: {settings.environment != 'production'}")
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.environment != "production",
        log_level=settings.log_level.lower()
    )