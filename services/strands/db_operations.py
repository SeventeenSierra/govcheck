"""
Database operations for the Strands service.

This module provides high-level database operations for analysis sessions,
compliance results, and document metadata with proper error handling and retry logic.
"""

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy import select, update, delete, func, and_, or_
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import selectinload

from database import get_async_session, retry_db_operation
from db_models import (
    AnalysisSessionDB, ComplianceResultsDB, ComplianceIssueDB, 
    DocumentMetadataDB, AnalysisStatus, ComplianceStatus, IssueSeverity
)
from models import (
    AnalysisStartRequest, ComplianceResults, ComplianceIssue, 
    ComplianceSummary, RegulatoryReference, DocumentLocation
)
from logging_config import get_logger

logger = get_logger(__name__)


class AnalysisSessionOperations:
    """Database operations for analysis sessions."""
    
    @staticmethod
    async def create_session(request: AnalysisStartRequest) -> str:
        """
        Create a new analysis session in the database.
        
        Args:
            request: Analysis start request with document information
            
        Returns:
            str: Session ID of the created session
        """
        async def _create_operation():
            async with get_async_session() as session:
                # Create new analysis session
                db_session = AnalysisSessionDB(
                    document_id=request.document_id,
                    filename=request.filename,
                    s3_key=request.s3_key,
                    analysis_type=request.analysis_type,
                    priority=request.priority,
                    callback_url=request.callback_url,
                    status=AnalysisStatus.QUEUED,
                    progress=0.0,
                    current_step="Initializing analysis",
                    started_at=datetime.utcnow(),
                    estimated_completion=datetime.utcnow() + timedelta(minutes=5)
                )
                
                session.add(db_session)
                await session.flush()  # Get the ID
                
                session_id = db_session.id
                logger.info(f"Created analysis session {session_id} for document {request.document_id}")
                return session_id
        
        return await retry_db_operation(_create_operation)
    
    @staticmethod
    async def get_session(session_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve an analysis session by ID.
        
        Args:
            session_id: Unique session identifier
            
        Returns:
            Dict containing session data or None if not found
        """
        async def _get_operation():
            async with get_async_session() as session:
                result = await session.execute(
                    select(AnalysisSessionDB).where(AnalysisSessionDB.id == session_id)
                )
                db_session = result.scalar_one_or_none()
                
                if db_session:
                    logger.debug(f"Retrieved analysis session {session_id}")
                    return db_session.to_dict()
                else:
                    logger.warning(f"Analysis session {session_id} not found")
                    return None
        
        return await retry_db_operation(_get_operation)
    
    @staticmethod
    async def update_session_status(
        session_id: str, 
        status: AnalysisStatus, 
        progress: float = None,
        current_step: str = None,
        error_message: str = None,
        completed_at: datetime = None,
        metadata: Dict[str, Any] = None
    ) -> bool:
        """
        Update analysis session status and progress.
        
        Args:
            session_id: Session to update
            status: New status
            progress: Progress percentage (0-100)
            current_step: Description of current step
            error_message: Error message if failed
            completed_at: Completion timestamp
            metadata: Additional metadata to merge
            
        Returns:
            bool: True if update successful
        """
        async def _update_operation():
            async with get_async_session() as session:
                # Build update values
                update_values = {
                    "status": status,
                    "updated_at": datetime.utcnow()
                }
                
                if progress is not None:
                    update_values["progress"] = progress
                if current_step is not None:
                    update_values["current_step"] = current_step
                if error_message is not None:
                    update_values["error_message"] = error_message
                if completed_at is not None:
                    update_values["completed_at"] = completed_at
                
                # Handle metadata merge
                if metadata:
                    # Get current session to merge metadata
                    result = await session.execute(
                        select(AnalysisSessionDB).where(AnalysisSessionDB.id == session_id)
                    )
                    db_session = result.scalar_one_or_none()
                    
                    if db_session:
                        current_metadata = db_session.session_metadata or {}
                        current_metadata.update(metadata)
                        update_values["session_metadata"] = current_metadata
                
                # Execute update
                result = await session.execute(
                    update(AnalysisSessionDB)
                    .where(AnalysisSessionDB.id == session_id)
                    .values(**update_values)
                )
                
                updated = result.rowcount > 0
                if updated:
                    logger.info(f"Updated analysis session {session_id} status to {status.value}")
                else:
                    logger.warning(f"Failed to update analysis session {session_id} - not found")
                
                return updated
        
        return await retry_db_operation(_update_operation)
    
    @staticmethod
    async def get_sessions_by_document(document_id: str) -> List[Dict[str, Any]]:
        """
        Get all analysis sessions for a document.
        
        Args:
            document_id: Document identifier
            
        Returns:
            List of session dictionaries
        """
        async def _get_operation():
            async with get_async_session() as session:
                result = await session.execute(
                    select(AnalysisSessionDB)
                    .where(AnalysisSessionDB.document_id == document_id)
                    .order_by(AnalysisSessionDB.started_at.desc())
                )
                sessions = result.scalars().all()
                
                logger.debug(f"Retrieved {len(sessions)} sessions for document {document_id}")
                return [s.to_dict() for s in sessions]
        
        return await retry_db_operation(_get_operation)
    
    @staticmethod
    async def get_active_sessions() -> List[Dict[str, Any]]:
        """
        Get all active (non-completed, non-failed) analysis sessions.
        
        Returns:
            List of active session dictionaries
        """
        async def _get_operation():
            async with get_async_session() as session:
                result = await session.execute(
                    select(AnalysisSessionDB)
                    .where(AnalysisSessionDB.status.in_([
                        AnalysisStatus.QUEUED,
                        AnalysisStatus.EXTRACTING,
                        AnalysisStatus.ANALYZING
                    ]))
                    .order_by(AnalysisSessionDB.started_at.asc())
                )
                sessions = result.scalars().all()
                
                logger.debug(f"Retrieved {len(sessions)} active sessions")
                return [s.to_dict() for s in sessions]
        
        return await retry_db_operation(_get_operation)


class ComplianceResultsOperations:
    """Database operations for compliance results."""
    
    @staticmethod
    async def store_results(results: ComplianceResults) -> str:
        """
        Store compliance analysis results in the database.
        
        Args:
            results: Complete compliance results to store
            
        Returns:
            str: ID of the stored results
        """
        async def _store_operation():
            async with get_async_session() as session:
                # Create compliance results record
                db_results = ComplianceResultsDB(
                    session_id=results.session_id,
                    document_id=results.document_id,
                    status=ComplianceStatus(results.status),
                    ai_model=results.ai_model,
                    processing_time=results.processing_time,
                    total_issues=results.summary.total_issues,
                    critical_count=results.summary.critical_count,
                    warning_count=results.summary.warning_count,
                    info_count=results.summary.info_count,
                    overall_score=results.summary.overall_score,
                    pass_threshold=results.summary.pass_threshold,
                    results_metadata=results.metadata,
                    generated_at=results.generated_at
                )
                
                session.add(db_results)
                await session.flush()  # Get the ID
                
                results_id = db_results.id
                
                # Store individual issues
                for issue in results.issues:
                    db_issue = ComplianceIssueDB(
                        results_id=results_id,
                        severity=IssueSeverity(issue.severity),
                        title=issue.title,
                        description=issue.description,
                        remediation=issue.remediation,
                        confidence=issue.confidence,
                        regulation_name=issue.regulation.regulation,
                        regulation_section=issue.regulation.section,
                        regulation_title=issue.regulation.title,
                        regulation_url=issue.regulation.url,
                        location_page=issue.location.page if issue.location else None,
                        location_section=issue.location.section if issue.location else None,
                        location_line=issue.location.line if issue.location else None,
                        location_context=issue.location.context if issue.location else None
                    )
                    session.add(db_issue)
                
                logger.info(f"Stored compliance results {results_id} for session {results.session_id}")
                return results_id
        
        return await retry_db_operation(_store_operation)
    
    @staticmethod
    async def get_results_by_session(session_id: str) -> Optional[ComplianceResults]:
        """
        Retrieve compliance results for a session.
        
        Args:
            session_id: Analysis session ID
            
        Returns:
            ComplianceResults object or None if not found
        """
        async def _get_operation():
            async with get_async_session() as session:
                result = await session.execute(
                    select(ComplianceResultsDB)
                    .options(selectinload(ComplianceResultsDB.issues))
                    .where(ComplianceResultsDB.session_id == session_id)
                )
                db_results = result.scalar_one_or_none()
                
                if not db_results:
                    logger.warning(f"No compliance results found for session {session_id}")
                    return None
                
                # Convert to Pydantic model
                issues = []
                for db_issue in db_results.issues:
                    issue = ComplianceIssue(
                        id=db_issue.id,
                        severity=db_issue.severity.value,
                        title=db_issue.title,
                        description=db_issue.description,
                        regulation=RegulatoryReference(
                            regulation=db_issue.regulation_name,
                            section=db_issue.regulation_section,
                            title=db_issue.regulation_title,
                            url=db_issue.regulation_url
                        ),
                        location=DocumentLocation(
                            page=db_issue.location_page,
                            section=db_issue.location_section,
                            line=db_issue.location_line,
                            context=db_issue.location_context
                        ) if any([
                            db_issue.location_page,
                            db_issue.location_section,
                            db_issue.location_line,
                            db_issue.location_context
                        ]) else None,
                        remediation=db_issue.remediation,
                        confidence=db_issue.confidence
                    )
                    issues.append(issue)
                
                compliance_results = ComplianceResults(
                    id=db_results.id,
                    session_id=db_results.session_id,
                    document_id=db_results.document_id,
                    status=db_results.status.value,
                    issues=issues,
                    summary=ComplianceSummary(
                        total_issues=db_results.total_issues,
                        critical_count=db_results.critical_count,
                        warning_count=db_results.warning_count,
                        info_count=db_results.info_count,
                        overall_score=db_results.overall_score,
                        pass_threshold=db_results.pass_threshold
                    ),
                    generated_at=db_results.generated_at,
                    ai_model=db_results.ai_model,
                    processing_time=db_results.processing_time,
                    metadata=db_results.results_metadata or {}
                )
                
                logger.debug(f"Retrieved compliance results for session {session_id}")
                return compliance_results
        
        return await retry_db_operation(_get_operation)
    
    @staticmethod
    async def get_results_by_document(document_id: str) -> List[ComplianceResults]:
        """
        Get all compliance results for a document.
        
        Args:
            document_id: Document identifier
            
        Returns:
            List of ComplianceResults objects
        """
        async def _get_operation():
            async with get_async_session() as session:
                result = await session.execute(
                    select(ComplianceResultsDB)
                    .options(selectinload(ComplianceResultsDB.issues))
                    .where(ComplianceResultsDB.document_id == document_id)
                    .order_by(ComplianceResultsDB.generated_at.desc())
                )
                db_results_list = result.scalars().all()
                
                results = []
                for db_results in db_results_list:
                    # Convert each result (similar to get_results_by_session)
                    issues = []
                    for db_issue in db_results.issues:
                        issue = ComplianceIssue(
                            id=db_issue.id,
                            severity=db_issue.severity.value,
                            title=db_issue.title,
                            description=db_issue.description,
                            regulation=RegulatoryReference(
                                regulation=db_issue.regulation_name,
                                section=db_issue.regulation_section,
                                title=db_issue.regulation_title,
                                url=db_issue.regulation_url
                            ),
                            location=DocumentLocation(
                                page=db_issue.location_page,
                                section=db_issue.location_section,
                                line=db_issue.location_line,
                                context=db_issue.location_context
                            ) if any([
                                db_issue.location_page,
                                db_issue.location_section,
                                db_issue.location_line,
                                db_issue.location_context
                            ]) else None,
                            remediation=db_issue.remediation,
                            confidence=db_issue.confidence
                        )
                        issues.append(issue)
                    
                    compliance_results = ComplianceResults(
                        id=db_results.id,
                        session_id=db_results.session_id,
                        document_id=db_results.document_id,
                        status=db_results.status.value,
                        issues=issues,
                        summary=ComplianceSummary(
                            total_issues=db_results.total_issues,
                            critical_count=db_results.critical_count,
                            warning_count=db_results.warning_count,
                            info_count=db_results.info_count,
                            overall_score=db_results.overall_score,
                            pass_threshold=db_results.pass_threshold
                        ),
                        generated_at=db_results.generated_at,
                        ai_model=db_results.ai_model,
                        processing_time=db_results.processing_time,
                        metadata=db_results.results_metadata or {}
                    )
                    results.append(compliance_results)
                
                logger.debug(f"Retrieved {len(results)} compliance results for document {document_id}")
                return results
        
        return await retry_db_operation(_get_operation)


class DocumentMetadataOperations:
    """Database operations for document metadata."""
    
    @staticmethod
    async def store_document_metadata(
        document_id: str,
        filename: str,
        original_filename: str,
        file_size: int,
        mime_type: str,
        s3_key: str,
        pdf_metadata: Dict[str, Any] = None
    ) -> str:
        """
        Store document metadata in the database.
        
        Args:
            document_id: Unique document identifier
            filename: Processed filename
            original_filename: Original uploaded filename
            file_size: File size in bytes
            mime_type: MIME type of the file
            s3_key: S3 object key
            pdf_metadata: Extracted PDF metadata
            
        Returns:
            str: ID of the stored metadata record
        """
        async def _store_operation():
            async with get_async_session() as session:
                db_metadata = DocumentMetadataDB(
                    document_id=document_id,
                    filename=filename,
                    original_filename=original_filename,
                    file_size=file_size,
                    mime_type=mime_type,
                    s3_key=s3_key,
                    pdf_metadata=pdf_metadata or {},
                    uploaded_at=datetime.utcnow()
                )
                
                session.add(db_metadata)
                await session.flush()
                
                metadata_id = db_metadata.id
                logger.info(f"Stored document metadata {metadata_id} for document {document_id}")
                return metadata_id
        
        return await retry_db_operation(_store_operation)
    
    @staticmethod
    async def get_document_metadata(document_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve document metadata by document ID.
        
        Args:
            document_id: Document identifier
            
        Returns:
            Dict containing metadata or None if not found
        """
        async def _get_operation():
            async with get_async_session() as session:
                result = await session.execute(
                    select(DocumentMetadataDB).where(DocumentMetadataDB.document_id == document_id)
                )
                db_metadata = result.scalar_one_or_none()
                
                if db_metadata:
                    logger.debug(f"Retrieved metadata for document {document_id}")
                    return db_metadata.to_dict()
                else:
                    logger.warning(f"No metadata found for document {document_id}")
                    return None
        
        return await retry_db_operation(_get_operation)


# Convenience functions for common operations
async def create_analysis_session(request: AnalysisStartRequest) -> str:
    """Create a new analysis session."""
    return await AnalysisSessionOperations.create_session(request)


async def get_analysis_session(session_id: str) -> Optional[Dict[str, Any]]:
    """Get analysis session by ID."""
    return await AnalysisSessionOperations.get_session(session_id)


async def update_analysis_progress(
    session_id: str,
    status: AnalysisStatus,
    progress: float = None,
    current_step: str = None,
    error_message: str = None
) -> bool:
    """Update analysis session progress."""
    completed_at = datetime.utcnow() if status in [AnalysisStatus.COMPLETED, AnalysisStatus.FAILED] else None
    
    return await AnalysisSessionOperations.update_session_status(
        session_id=session_id,
        status=status,
        progress=progress,
        current_step=current_step,
        error_message=error_message,
        completed_at=completed_at
    )


async def store_compliance_results(results: ComplianceResults) -> str:
    """Store compliance analysis results."""
    return await ComplianceResultsOperations.store_results(results)


async def get_compliance_results(session_id: str) -> Optional[ComplianceResults]:
    """Get compliance results by session ID."""
    return await ComplianceResultsOperations.get_results_by_session(session_id)