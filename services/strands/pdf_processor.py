# SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
# SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

"""
PDF document processing for text extraction and analysis.

This module handles PDF document processing, including text extraction,
metadata parsing, and document structure analysis for compliance checking.
"""

import io
import logging
from typing import Dict, Any, Optional, Tuple
from pathlib import Path

import PyPDF2
import boto3
from botocore.exceptions import ClientError

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class PDFProcessor:
    """PDF document processor for text extraction and analysis."""
    
    def __init__(self):
        """Initialize the PDF processor with S3 client."""
        self._s3_client = None
        self._initialize_s3_client()
    
    def _initialize_s3_client(self) -> None:
        """Initialize S3 client for document retrieval."""
        try:
            # Configure S3 client for MinIO or AWS S3
            s3_config = {
                'region_name': settings.aws_region
            }
            
            # Add endpoint URL for MinIO (local development)
            if settings.s3_endpoint_url:
                s3_config['endpoint_url'] = settings.s3_endpoint_url
            
            # Add credentials if provided
            if settings.s3_access_key and settings.s3_secret_key:
                s3_config.update({
                    'aws_access_key_id': settings.s3_access_key,
                    'aws_secret_access_key': settings.s3_secret_key
                })
            
            self._s3_client = boto3.client('s3', **s3_config)
            logger.info("Initialized S3 client for document retrieval")
            
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {e}")
            self._s3_client = None
    
    async def extract_text_from_s3(self, s3_key: str, bucket_name: Optional[str] = None) -> Tuple[str, Dict[str, Any]]:
        """
        Extract text from a PDF document stored in S3/MinIO.
        
        Args:
            s3_key: S3 object key for the PDF document
            bucket_name: S3 bucket name (defaults to configured bucket)
            
        Returns:
            Tuple of (extracted_text, metadata)
            
        Raises:
            Exception: If document retrieval or processing fails
        """
        if not self._s3_client:
            raise Exception("S3 client not initialized")
        
        bucket = bucket_name or settings.s3_bucket_name
        
        try:
            logger.info(f"Retrieving document from S3: {bucket}/{s3_key}")
            
            # Download the PDF from S3
            response = self._s3_client.get_object(Bucket=bucket, Key=s3_key)
            pdf_content = response['Body'].read()
            
            # Extract text and metadata
            text, metadata = self._extract_text_from_bytes(pdf_content)
            
            # Add S3 metadata
            metadata.update({
                's3_bucket': bucket,
                's3_key': s3_key,
                'content_length': len(pdf_content),
                'last_modified': response.get('LastModified'),
                'content_type': response.get('ContentType', 'application/pdf')
            })
            
            logger.info(f"Successfully extracted {len(text)} characters from {s3_key}")
            return text, metadata
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'NoSuchKey':
                raise Exception(f"Document not found in S3: {s3_key}")
            elif error_code == 'NoSuchBucket':
                raise Exception(f"S3 bucket not found: {bucket}")
            else:
                raise Exception(f"S3 error retrieving document: {e}")
                
        except Exception as e:
            logger.error(f"Failed to extract text from S3 document {s3_key}: {e}")
            raise Exception(f"Document processing failed: {str(e)}")
    
    def _extract_text_from_bytes(self, pdf_bytes: bytes) -> Tuple[str, Dict[str, Any]]:
        """
        Extract text and metadata from PDF bytes.
        
        Args:
            pdf_bytes: Raw PDF file content
            
        Returns:
            Tuple of (extracted_text, metadata)
        """
        try:
            # Create a BytesIO object from the PDF bytes
            pdf_stream = io.BytesIO(pdf_bytes)
            
            # Initialize PDF reader
            pdf_reader = PyPDF2.PdfReader(pdf_stream)
            
            # Extract metadata
            metadata = self._extract_pdf_metadata(pdf_reader)
            
            # Extract text from all pages
            extracted_text = []
            page_count = len(pdf_reader.pages)
            
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text.strip():  # Only add non-empty pages
                        # Add page marker for location tracking
                        extracted_text.append(f"\n--- Page {page_num + 1} ---\n")
                        extracted_text.append(page_text)
                        
                except Exception as e:
                    logger.warning(f"Failed to extract text from page {page_num + 1}: {e}")
                    extracted_text.append(f"\n--- Page {page_num + 1} (extraction failed) ---\n")
            
            full_text = "".join(extracted_text)
            
            # Update metadata with extraction results
            metadata.update({
                'page_count': page_count,
                'text_length': len(full_text),
                'extraction_method': 'PyPDF2',
                'pages_processed': page_count,
                'extraction_successful': True
            })
            
            # Clean and normalize the text
            cleaned_text = self._clean_extracted_text(full_text)
            
            return cleaned_text, metadata
            
        except Exception as e:
            logger.error(f"PDF text extraction failed: {e}")
            # Return minimal metadata for failed extraction
            error_metadata = {
                'extraction_successful': False,
                'extraction_error': str(e),
                'extraction_method': 'PyPDF2'
            }
            raise Exception(f"Text extraction failed: {str(e)}")
    
    def _extract_pdf_metadata(self, pdf_reader: PyPDF2.PdfReader) -> Dict[str, Any]:
        """
        Extract metadata from PDF document.
        
        Args:
            pdf_reader: PyPDF2 PdfReader instance
            
        Returns:
            Dictionary containing PDF metadata
        """
        metadata = {}
        
        try:
            # Get document info
            if pdf_reader.metadata:
                doc_info = pdf_reader.metadata
                
                # Extract standard metadata fields
                metadata.update({
                    'title': doc_info.get('/Title', '').strip() if doc_info.get('/Title') else None,
                    'author': doc_info.get('/Author', '').strip() if doc_info.get('/Author') else None,
                    'subject': doc_info.get('/Subject', '').strip() if doc_info.get('/Subject') else None,
                    'creator': doc_info.get('/Creator', '').strip() if doc_info.get('/Creator') else None,
                    'producer': doc_info.get('/Producer', '').strip() if doc_info.get('/Producer') else None,
                    'creation_date': doc_info.get('/CreationDate'),
                    'modification_date': doc_info.get('/ModDate')
                })
            
            # Add document structure info
            metadata.update({
                'is_encrypted': pdf_reader.is_encrypted,
                'page_count': len(pdf_reader.pages)
            })
            
        except Exception as e:
            logger.warning(f"Failed to extract PDF metadata: {e}")
            metadata['metadata_extraction_error'] = str(e)
        
        return metadata
    
    def _clean_extracted_text(self, text: str) -> str:
        """
        Clean and normalize extracted text for analysis.
        
        Args:
            text: Raw extracted text
            
        Returns:
            Cleaned and normalized text
        """
        if not text:
            return ""
        
        # Basic text cleaning
        lines = text.split('\n')
        cleaned_lines = []
        
        for line in lines:
            # Strip whitespace
            line = line.strip()
            
            # Skip empty lines and page markers
            if not line or line.startswith('--- Page'):
                cleaned_lines.append(line)
                continue
            
            # Remove excessive whitespace
            line = ' '.join(line.split())
            
            # Add the cleaned line
            cleaned_lines.append(line)
        
        # Join lines and normalize spacing
        cleaned_text = '\n'.join(cleaned_lines)
        
        # Remove excessive newlines
        while '\n\n\n' in cleaned_text:
            cleaned_text = cleaned_text.replace('\n\n\n', '\n\n')
        
        return cleaned_text.strip()


# Global PDF processor instance
_pdf_processor = None


def get_pdf_processor() -> PDFProcessor:
    """Get the global PDF processor instance."""
    global _pdf_processor
    if _pdf_processor is None:
        _pdf_processor = PDFProcessor()
    return _pdf_processor