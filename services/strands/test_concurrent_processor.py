"""
Tests for the concurrent processor functionality.

This module tests the concurrent processing capabilities including
worker pools, task queuing, and progress tracking.
"""

import pytest
import asyncio
from datetime import datetime
from unittest.mock import AsyncMock, patch

from concurrent_processor import (
    ConcurrentProcessor, 
    AnalysisTask, 
    TaskPriority,
    get_processor,
    submit_analysis_task,
    get_processing_status
)
from models import AnalysisStartRequest


@pytest.fixture
def processor():
    """Create a test processor instance."""
    return ConcurrentProcessor(max_workers=2)


@pytest.fixture
def sample_request():
    """Create a sample analysis request."""
    return AnalysisStartRequest(
        document_id="test-doc-123",
        filename="test-document.pdf",
        s3_key="documents/test-document.pdf",
        analysis_type="compliance",
        priority="normal"
    )


@pytest.mark.asyncio
async def test_processor_initialization():
    """Test processor initialization with correct worker count."""
    processor = ConcurrentProcessor(max_workers=3)
    
    assert processor.max_workers == 3
    assert processor.task_queue.qsize() == 0
    assert len(processor.active_tasks) == 0
    assert len(processor.workers) == 0
    
    await processor.stop()


@pytest.mark.asyncio
async def test_task_creation():
    """Test analysis task creation and priority ordering."""
    request = AnalysisStartRequest(
        document_id="test-doc",
        filename="test.pdf",
        s3_key="test.pdf",
        priority="high"
    )
    
    task = AnalysisTask(
        session_id="session-123",
        request=request,
        priority=TaskPriority.HIGH
    )
    
    assert task.session_id == "session-123"
    assert task.priority == TaskPriority.HIGH
    assert task.retry_count == 0
    assert task.started_at is None


@pytest.mark.asyncio
async def test_task_priority_ordering():
    """Test that tasks are ordered by priority correctly."""
    high_task = AnalysisTask("high", None, TaskPriority.HIGH)
    normal_task = AnalysisTask("normal", None, TaskPriority.NORMAL)
    low_task = AnalysisTask("low", None, TaskPriority.LOW)
    
    # High priority should be "less than" (higher priority in queue)
    assert high_task < normal_task
    assert normal_task < low_task
    assert high_task < low_task


@pytest.mark.asyncio
async def test_submit_task(processor, sample_request):
    """Test submitting a task to the processor queue."""
    try:
        # Mock the processing function
        mock_process = AsyncMock()
        
        # Start processor
        await processor.start(mock_process)
        
        # Submit task
        success = await processor.submit_task("session-123", sample_request)
        
        assert success is True
        assert processor.task_queue.qsize() == 1
    finally:
        await processor.stop()


@pytest.mark.asyncio
async def test_queue_status(processor, sample_request):
    """Test getting queue status information."""
    try:
        # Mock the processing function
        mock_process = AsyncMock()
        
        # Start processor
        await processor.start(mock_process)
        
        # Submit a task
        await processor.submit_task("session-123", sample_request)
        
        # Get status
        status = await processor.get_queue_status()
        
        assert status["queue_size"] >= 0
        assert status["max_workers"] == 2
        assert status["total_processed"] == 0
        assert len(status["workers"]) == 2
        
        # Check worker info structure
        for worker in status["workers"]:
            assert "worker_id" in worker
            assert "tasks_completed" in worker
            assert "tasks_failed" in worker
    finally:
        await processor.stop()


@pytest.mark.asyncio
async def test_processor_with_mock_processing():
    """Test processor with a mock processing function."""
    processor = ConcurrentProcessor(max_workers=1)
    
    # Create a mock processing function that completes quickly
    async def mock_process_analysis(session_id: str):
        await asyncio.sleep(0.1)  # Simulate some work
        return f"Processed {session_id}"
    
    try:
        await processor.start(mock_process_analysis)
        
        # Submit a task
        request = AnalysisStartRequest(
            document_id="test-doc",
            filename="test.pdf",
            s3_key="test.pdf"
        )
        
        success = await processor.submit_task("test-session", request)
        assert success is True
        
        # Wait a bit for processing
        await asyncio.sleep(0.2)
        
        # Check that task was processed
        status = await processor.get_queue_status()
        assert status["queue_size"] == 0  # Should be empty after processing
        
    finally:
        await processor.stop()


@pytest.mark.asyncio
async def test_global_processor_functions(sample_request):
    """Test the global processor convenience functions."""
    # Test submit function
    success = await submit_analysis_task("session-123", sample_request)
    assert success is True
    
    # Test status function
    status = await get_processing_status()
    assert "queue_size" in status
    assert "max_workers" in status


@pytest.mark.asyncio
async def test_processor_shutdown():
    """Test graceful processor shutdown."""
    processor = ConcurrentProcessor(max_workers=2)
    
    # Mock processing function
    async def mock_process(session_id: str):
        await asyncio.sleep(1.0)  # Longer task
    
    await processor.start(mock_process)
    
    # Verify workers are running
    assert len(processor.workers) == 2
    
    # Stop processor
    await processor.stop(timeout=0.5)
    
    # Verify cleanup
    assert len(processor.workers) == 0
    assert len(processor.worker_stats) == 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])