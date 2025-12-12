# SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
# SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

"""
Database configuration and session management for the Strands service.

This module provides SQLAlchemy configuration, connection pooling,
and database session management with retry logic.
"""

import asyncio
import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional
from sqlalchemy import create_engine, event, pool
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError, DisconnectionError, OperationalError
from sqlalchemy.pool import QueuePool

from config import get_settings
from logging_config import get_logger

logger = get_logger(__name__)
settings = get_settings()

# Create declarative base for ORM models
Base = declarative_base()

# Database engines and session makers
async_engine: Optional[object] = None
sync_engine: Optional[object] = None
AsyncSessionLocal: Optional[async_sessionmaker] = None
SessionLocal: Optional[sessionmaker] = None


def create_database_engines():
    """
    Create both async and sync database engines with connection pooling.
    
    Returns:
        Tuple of (async_engine, sync_engine)
    """
    global async_engine, sync_engine, AsyncSessionLocal, SessionLocal
    
    # Convert PostgreSQL URL to async version for async engine
    async_database_url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://")
    
    # Create async engine with connection pooling
    async_engine = create_async_engine(
        async_database_url,
        poolclass=QueuePool,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=3600,  # Recycle connections every hour
        echo=settings.log_level.upper() == "DEBUG",
        future=True
    )
    
    # Create sync engine for migrations and synchronous operations
    sync_engine = create_engine(
        settings.database_url,
        poolclass=QueuePool,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=settings.log_level.upper() == "DEBUG",
        future=True
    )
    
    # Create session makers
    AsyncSessionLocal = async_sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=True,
        autocommit=False
    )
    
    SessionLocal = sessionmaker(
        bind=sync_engine,
        autoflush=True,
        autocommit=False
    )
    
    # Add connection event listeners for logging
    @event.listens_for(sync_engine, "connect")
    def receive_connect(dbapi_connection, connection_record):
        logger.info("Database connection established")
    
    @event.listens_for(sync_engine, "disconnect")
    def receive_disconnect(dbapi_connection, connection_record):
        logger.info("Database connection closed")
    
    logger.info("Database engines created successfully")
    return async_engine, sync_engine


async def init_database():
    """
    Initialize database tables and perform startup checks.
    
    This function creates all tables defined in the models and
    verifies database connectivity.
    """
    try:
        logger.info("Initializing database...")
        
        # Import models to ensure they're registered with Base
        from db_models import AnalysisSessionDB, ComplianceResultsDB, ComplianceIssueDB
        
        # Create engines if not already created
        if async_engine is None or sync_engine is None:
            create_database_engines()
        
        # Create all tables using sync engine
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=sync_engine)
        
        # Test async connection
        async with get_async_session() as session:
            await session.execute("SELECT 1")
            logger.info("Async database connection verified")
        
        # Test sync connection
        with get_sync_session() as session:
            session.execute("SELECT 1")
            logger.info("Sync database connection verified")
        
        logger.info("Database initialization completed successfully")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise


@asynccontextmanager
async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Get an async database session with automatic cleanup.
    
    Yields:
        AsyncSession: Database session for async operations
    """
    if AsyncSessionLocal is None:
        raise RuntimeError("Database not initialized. Call init_database() first.")
    
    session = AsyncSessionLocal()
    try:
        yield session
        await session.commit()
    except Exception as e:
        await session.rollback()
        logger.error(f"Database session error: {e}")
        raise
    finally:
        await session.close()


@asynccontextmanager
async def get_sync_session() -> AsyncGenerator[Session, None]:
    """
    Get a sync database session with automatic cleanup.
    
    Yields:
        Session: Database session for sync operations
    """
    if SessionLocal is None:
        raise RuntimeError("Database not initialized. Call init_database() first.")
    
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"Database session error: {e}")
        raise
    finally:
        session.close()


async def retry_db_operation(operation, max_retries: int = 3, delay: float = 1.0):
    """
    Retry database operations with exponential backoff.
    
    Args:
        operation: Async function to retry
        max_retries: Maximum number of retry attempts
        delay: Initial delay between retries in seconds
        
    Returns:
        Result of the operation
        
    Raises:
        Exception: Last exception if all retries fail
    """
    last_exception = None
    
    for attempt in range(max_retries + 1):
        try:
            return await operation()
        except (SQLAlchemyError, DisconnectionError, OperationalError) as e:
            last_exception = e
            
            if attempt == max_retries:
                logger.error(f"Database operation failed after {max_retries} retries: {e}")
                break
            
            wait_time = delay * (2 ** attempt)  # Exponential backoff
            logger.warning(f"Database operation failed (attempt {attempt + 1}/{max_retries + 1}): {e}")
            logger.info(f"Retrying in {wait_time:.1f} seconds...")
            await asyncio.sleep(wait_time)
    
    raise last_exception


async def check_database_health() -> dict:
    """
    Check database connectivity and return health status.
    
    Returns:
        Dict containing health check results
    """
    health_status = {
        "database": "unknown",
        "async_connection": "unknown",
        "sync_connection": "unknown",
        "connection_pool": "unknown"
    }
    
    try:
        # Test async connection
        async with get_async_session() as session:
            await session.execute("SELECT 1")
            health_status["async_connection"] = "ok"
        
        # Test sync connection
        with get_sync_session() as session:
            session.execute("SELECT 1")
            health_status["sync_connection"] = "ok"
        
        # Check connection pool status
        if async_engine and sync_engine:
            async_pool_status = async_engine.pool.status()
            sync_pool_status = sync_engine.pool.status()
            
            if async_pool_status and sync_pool_status:
                health_status["connection_pool"] = "ok"
            else:
                health_status["connection_pool"] = "warning"
        
        # Overall database status
        if all(status == "ok" for key, status in health_status.items() if key != "database"):
            health_status["database"] = "ok"
        else:
            health_status["database"] = "warning"
            
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        health_status["database"] = "error"
        health_status["error"] = str(e)
    
    return health_status


async def close_database_connections():
    """Close all database connections and clean up resources."""
    global async_engine, sync_engine, AsyncSessionLocal, SessionLocal
    
    try:
        if async_engine:
            await async_engine.dispose()
            logger.info("Async database engine disposed")
        
        if sync_engine:
            sync_engine.dispose()
            logger.info("Sync database engine disposed")
        
        # Reset global variables
        async_engine = None
        sync_engine = None
        AsyncSessionLocal = None
        SessionLocal = None
        
        logger.info("Database connections closed successfully")
        
    except Exception as e:
        logger.error(f"Error closing database connections: {e}")