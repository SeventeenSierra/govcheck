#!/usr/bin/env python3

# SPDX-License-Identifier: AGPL-3.0-or-later
# SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

"""
Startup script for the Strands service.

This script handles initialization tasks before starting the main FastAPI application:
1. Wait for database connectivity
2. Run database migrations if needed
3. Initialize seeding
4. Start the main application
"""

import asyncio
import sys
import time
import os
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from config import get_settings
from logging_config import setup_logging, get_logger
from database import create_database_engines, init_database, check_database_health
from seed_manager import initialize_seeding

# Initialize logging
setup_logging()
logger = get_logger(__name__)
settings = get_settings()


async def wait_for_database(max_retries: int = 30, delay: float = 2.0) -> bool:
    """
    Wait for database to become available.
    
    Args:
        max_retries: Maximum number of connection attempts
        delay: Delay between attempts in seconds
        
    Returns:
        True if database is available, False otherwise
    """
    logger.info("Waiting for database to become available...")
    
    for attempt in range(max_retries):
        try:
            # Create database engines
            create_database_engines()
            
            # Check database health
            health = await check_database_health()
            
            if health.get("database") == "ok":
                logger.info("Database is available and healthy")
                return True
            else:
                logger.warning(f"Database health check failed: {health}")
                
        except Exception as e:
            logger.warning(f"Database connection attempt {attempt + 1}/{max_retries} failed: {e}")
        
        if attempt < max_retries - 1:
            logger.info(f"Retrying in {delay} seconds...")
            await asyncio.sleep(delay)
    
    logger.error("Database did not become available within the timeout period")
    return False


async def initialize_service() -> bool:
    """
    Initialize the Strands service.
    
    Returns:
        True if initialization successful, False otherwise
    """
    try:
        logger.info("Starting Strands service initialization...")
        
        # Step 1: Wait for database
        if not await wait_for_database():
            logger.error("Failed to connect to database")
            return False
        
        # Step 2: Initialize database schema
        logger.info("Initializing database schema...")
        try:
            await init_database()
            logger.info("Database schema initialization completed")
        except Exception as e:
            logger.error(f"Database schema initialization failed: {e}")
            return False
        
        # Step 3: Initialize seeding
        logger.info("Initializing database seeding...")
        try:
            await initialize_seeding()
            logger.info("Database seeding initialization completed")
        except Exception as e:
            logger.error(f"Database seeding initialization failed: {e}")
            # Don't fail startup for seeding issues
            logger.warning("Continuing without seeding initialization")
        
        # Step 4: Verify service dependencies
        logger.info("Verifying service dependencies...")
        try:
            # Check AWS Bedrock availability
            from aws_bedrock import get_bedrock_client
            bedrock_client = get_bedrock_client()
            if bedrock_client.is_available():
                logger.info("AWS Bedrock client is available")
            else:
                logger.warning("AWS Bedrock client not available - will use fallback analysis")
            
            # Check S3/MinIO connectivity
            from pdf_processor import get_pdf_processor
            pdf_processor = get_pdf_processor()
            if pdf_processor._s3_client:
                logger.info("S3/MinIO client is available")
            else:
                logger.warning("S3/MinIO client not available")
            
            logger.info("Service dependency verification completed")
            
        except Exception as e:
            logger.warning(f"Service dependency verification failed: {e}")
            logger.warning("Some services may not be fully functional")
        
        logger.info("Strands service initialization completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Service initialization failed: {e}")
        return False


def main():
    """Main startup function."""
    logger.info("Starting Strands service startup script...")
    
    # Run initialization
    success = asyncio.run(initialize_service())
    
    if not success:
        logger.error("Service initialization failed - exiting")
        sys.exit(1)
    
    # Start the main FastAPI application
    logger.info("Starting FastAPI application...")
    
    try:
        import uvicorn
        from main import app
        
        uvicorn.run(
            app,
            host=settings.host,
            port=settings.port,
            reload=settings.environment != "production",
            log_level=settings.log_level.lower(),
            access_log=True
        )
        
    except Exception as e:
        logger.error(f"Failed to start FastAPI application: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()