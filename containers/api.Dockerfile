# SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
# SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

# Development Dockerfile for Strands Python service
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY services/strands/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY services/strands/ .

# Expose port
EXPOSE 8080

# Set environment variables for development
ENV PYTHONPATH=/app
ENV PYTHON_ENV=development
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start development server
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]