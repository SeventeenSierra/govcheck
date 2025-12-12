"""
Database seeding manager for the Strands service.

This module handles seeding the database with document metadata from
the src/seed-data directory and manages file operations for seeded documents.
"""

import os
import asyncio
import hashlib
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from database import get_async_session, get_sync_session, init_database
from db_models import DocumentMetadataDB
from logging_config import get_logger

logger = get_logger(__name__)


class SeedManager:
    """Manages database seeding operations for document metadata."""
    
    def __init__(self, seed_data_path: str = "/app/src/seed-data"):
        """
        Initialize the seed manager.
        
        Args:
            seed_data_path: Path to the seed data directory containing PDFs
        """
        self.seed_data_path = Path(seed_data_path)
        self.expected_documents = self._get_expected_documents()
    
    def _get_expected_documents(self) -> List[Dict[str, Any]]:
        """
        Get list of expected documents from the seed data directory.
        
        Returns:
            List of document metadata dictionaries
        """
        documents = []
        
        # Define the expected 30 PDF files based on the actual files in src/seed-data
        expected_files = [
            # Baecher Joseph proposals
            {
                "document_id": "d1f8a239-27c0-4a38-a333-ea4e82533d1b",
                "filename": "baecher_joseph_2023_d1f8a239-27c0-4a38-a333-ea4e82533d1b_PROPOSAL_1.pdf",
                "original_filename": "baecher_joseph_2023_PROPOSAL_1.pdf",
                "metadata": {"author": "Joseph Baecher", "year": 2023, "funder": "NSF", "program": "Research Grant"}
            },
            {
                "document_id": "c6f0ae22-48ba-4044-a44c-d860f9b8d17f",
                "filename": "baecher_joseph_2024_c6f0ae22-48ba-4044-a44c-d860f9b8d17f_PROPOSAL_1.pdf",
                "original_filename": "baecher_joseph_2024_PROPOSAL_1.pdf",
                "metadata": {"author": "Joseph Baecher", "year": 2024, "funder": "NSF", "program": "Research Grant"}
            },
            # Barker Michelle proposal
            {
                "document_id": "1b5d2213-4c72-4da8-a7b8-bece5b27d280",
                "filename": "barker_michelle_2020_1b5d2213-4c72-4da8-a7b8-bece5b27d280_PROPOSAL_1.pdf",
                "original_filename": "barker_michelle_2020_PROPOSAL_1.pdf",
                "metadata": {
                    "author": "Michelle Barker", 
                    "year": 2020, 
                    "funder": "Wellcome Trust", 
                    "program": "Discretionary",
                    "title": "FAIR for Research Software projects"
                }
            },
            # Bertolet Brittnil proposal
            {
                "document_id": "9d34d838-4fd8-4fbd-b94e-766d1dd82d23",
                "filename": "bertolet_brittnil_2021_9d34d838-4fd8-4fbd-b94e-766d1dd82d23_PROPOSAL_1.pdf",
                "original_filename": "bertolet_brittnil_2021_PROPOSAL_1.pdf",
                "metadata": {"author": "Brittnil Bertolet", "year": 2021, "funder": "NSF", "program": "Research Grant"}
            },
            # Brown Ctitus proposal
            {
                "document_id": "afd7eaff-7bea-45d0-be3e-33188b448cd1",
                "filename": "brown_ctitus_2014_afd7eaff-7bea-45d0-be3e-33188b448cd1_PROPOSAL_1.pdf",
                "original_filename": "brown_ctitus_2014_PROPOSAL_1.pdf",
                "metadata": {"author": "Ctitus Brown", "year": 2014, "funder": "NSF", "program": "Research Grant"}
            },
            # Burnette Elizabeth proposal
            {
                "document_id": "c2106ced-aa31-4c18-befb-9309a38122bc",
                "filename": "burnette_elizabeth_2020_c2106ced-aa31-4c18-befb-9309a38122bc_PROPOSAL_1.pdf",
                "original_filename": "burnette_elizabeth_2020_PROPOSAL_1.pdf",
                "metadata": {"author": "Elizabeth Burnette", "year": 2020, "funder": "NSF", "program": "Research Grant"}
            },
            # Dasari Mauna proposal
            {
                "document_id": "4a81a377-e0e9-43b6-b301-7a3058b0d012",
                "filename": "dasari_mauna_2021_4a81a377-e0e9-43b6-b301-7a3058b0d012_PROPOSAL_1.pdf",
                "original_filename": "dasari_mauna_2021_PROPOSAL_1.pdf",
                "metadata": {
                    "author": "Mauna Dasari", 
                    "year": 2021, 
                    "funder": "U.S. National Science Foundation (NSF)",
                    "program": "Postdoctoral Research Fellowship in Biology (Area: Rules of Life)",
                    "title": "Using metacommunity theory to assess the impact of multi-species interactions on gut microbial assembly"
                }
            },
            # Dumitrescu Adna proposal
            {
                "document_id": "73405efc-b6bc-4787-ae90-005cc7c970e1",
                "filename": "dumitrescu_adna_2020_73405efc-b6bc-4787-ae90-005cc7c970e1_PROPOSAL_1.pdf",
                "original_filename": "dumitrescu_adna_2020_PROPOSAL_1.pdf",
                "metadata": {"author": "Adna Dumitrescu", "year": 2020, "funder": "NSF", "program": "Research Grant"}
            },
            # Durvasula Arun proposals (3 documents)
            {
                "document_id": "a6181fb8-a808-4808-abe9-627b5249b5ba-1",
                "filename": "durvasula_arun_2018_a6181fb8-a808-4808-abe9-627b5249b5ba_PROPOSAL_1.pdf",
                "original_filename": "durvasula_arun_2018_PROPOSAL_1.pdf",
                "metadata": {"author": "Arun Durvasula", "year": 2018, "funder": "NSF", "program": "Research Grant", "proposal_number": 1}
            },
            {
                "document_id": "a6181fb8-a808-4808-abe9-627b5249b5ba-2",
                "filename": "durvasula_arun_2018_a6181fb8-a808-4808-abe9-627b5249b5ba_PROPOSAL_2.pdf",
                "original_filename": "durvasula_arun_2018_PROPOSAL_2.pdf",
                "metadata": {"author": "Arun Durvasula", "year": 2018, "funder": "NSF", "program": "Research Grant", "proposal_number": 2}
            },
            {
                "document_id": "a6181fb8-a808-4808-abe9-627b5249b5ba-3",
                "filename": "durvasula_arun_2018_a6181fb8-a808-4808-abe9-627b5249b5ba_PROPOSAL_3.pdf",
                "original_filename": "durvasula_arun_2018_PROPOSAL_3.pdf",
                "metadata": {"author": "Arun Durvasula", "year": 2018, "funder": "NSF", "program": "Research Grant", "proposal_number": 3}
            },
            # Continue with remaining documents...
            {
                "document_id": "74f22e94-b364-482e-a2c1-0892b705f0c6",
                "filename": "frazer_ryane_2019_74f22e94-b364-482e-a2c1-0892b705f0c6_PROPOSAL_1.pdf",
                "original_filename": "frazer_ryane_2019_PROPOSAL_1.pdf",
                "metadata": {"author": "Ryane Frazer", "year": 2019, "funder": "NSF", "program": "Research Grant"}
            },
            {
                "document_id": "7f2475c4-2fad-498f-beac-e3044183b996",
                "filename": "gregory_samantha_2018_7f2475c4-2fad-498f-beac-e3044183b996_PROPOSAL_1.pdf",
                "original_filename": "gregory_samantha_2018_PROPOSAL_1.pdf",
                "metadata": {"author": "Samantha Gregory", "year": 2018, "funder": "NSF", "program": "Research Grant"}
            },
            {
                "document_id": "7df74802-fd8e-4625-b65a-ea403b5b90eb",
                "filename": "howard_cody_2018_7df74802-fd8e-4625-b65a-ea403b5b90eb_PROPOSAL_1.pdf",
                "original_filename": "howard_cody_2018_PROPOSAL_1.pdf",
                "metadata": {"author": "Cody Howard", "year": 2018, "funder": "NSF", "program": "Research Grant"}
            },
            {
                "document_id": "83149f42-7406-48f8-996a-6936727b3dca",
                "filename": "huber_felix_2017_83149f42-7406-48f8-996a-6936727b3dca_PROPOSAL_1.pdf",
                "original_filename": "huber_felix_2017_PROPOSAL_1.pdf",
                "metadata": {"author": "Felix Huber", "year": 2017, "funder": "NSF", "program": "Research Grant"}
            },
            {
                "document_id": "02ecd4f0-ac84-4cf4-8d10-1aed8faa6767",
                "filename": "jensen_jan_2015_02ecd4f0-ac84-4cf4-8d10-1aed8faa6767_PROPOSAL_1.pdf",
                "original_filename": "jensen_jan_2015_PROPOSAL_1.pdf",
                "metadata": {
                    "author": "Jan Jensen", 
                    "year": 2015, 
                    "funder": "Danish National Science Foundation",
                    "program": "Chemical Physics",
                    "title": "High Throughput pKa Prediction Using Semi Empirical Methods"
                }
            },
            # Continue with remaining documents...
            {
                "document_id": "a5b26dc5-0ee9-40c8-84fd-0e3cede9b81b",
                "filename": "komarov_ilya_2020_a5b26dc5-0ee9-40c8-84fd-0e3cede9b81b_PROPOSAL_1.pdf",
                "original_filename": "komarov_ilya_2020_PROPOSAL_1.pdf",
                "metadata": {"author": "Ilya Komarov", "year": 2020, "funder": "NSF", "program": "Research Grant"}
            },
            {
                "document_id": "63807985-2a63-463b-afea-fae710d3fe6c",
                "filename": "miller_henrye_2020_63807985-2a63-463b-afea-fae710d3fe6c_PROPOSAL_1.pdf",
                "original_filename": "miller_henrye_2020_PROPOSAL_1.pdf",
                "metadata": {"author": "Henrye Miller", "year": 2020, "funder": "NSF", "program": "Research Grant"}
            },
            {
                "document_id": "6306262d-9317-4f58-aadc-caf26325862d",
                "filename": "nell_lucas_2022_6306262d-9317-4f58-aadc-caf26325862d_PROPOSAL_1.pdf",
                "original_filename": "nell_lucas_2022_PROPOSAL_1.pdf",
                "metadata": {"author": "Lucas Nell", "year": 2022, "funder": "NSF", "program": "Research Grant"}
            },
            {
                "document_id": "f990c0ee-e9e0-4f31-b050-9ed3a0b4c2e5",
                "filename": "polino_alexander_2017_f990c0ee-e9e0-4f31-b050-9ed3a0b4c2e5_PROPOSAL_1.pdf",
                "original_filename": "polino_alexander_2017_PROPOSAL_1.pdf",
                "metadata": {"author": "Alexander Polino", "year": 2017, "funder": "NSF", "program": "Research Grant"}
            },
            {
                "document_id": "7c82d464-e242-4d87-a885-5cf34776edba",
                "filename": "rick_jessica_2021_7c82d464-e242-4d87-a885-5cf34776edba_PROPOSAL_1.pdf",
                "original_filename": "rick_jessica_2021_PROPOSAL_1.pdf",
                "metadata": {"author": "Jessica Rick", "year": 2021, "funder": "NSF", "program": "Research Grant"}
            },
            {
                "document_id": "4b7df1c7-1b2a-4453-b28b-8155e538092a",
                "filename": "ross-ibarra_jeff_2015_4b7df1c7-1b2a-4453-b28b-8155e538092a_PROPOSAL_1.pdf",
                "original_filename": "ross-ibarra_jeff_2015_PROPOSAL_1.pdf",
                "metadata": {"author": "Jeff Ross-Ibarra", "year": 2015, "funder": "NSF", "program": "Research Grant"}
            },
            {
                "document_id": "b2f9e87e-691f-4d7b-9562-bc5d41940d68",
                "filename": "scott_catherine_2015_b2f9e87e-691f-4d7b-9562-bc5d41940d68_PROPOSAL_1.pdf",
                "original_filename": "scott_catherine_2015_PROPOSAL_1.pdf",
                "metadata": {"author": "Catherine Scott", "year": 2015, "funder": "NSF", "program": "Research Grant"}
            },
            {
                "document_id": "84088593-1546-4a1b-994e-1f15232324a8",
                "filename": "sinclair_alyssa_2019_84088593-1546-4a1b-994e-1f15232324a8_PROPOSAL_1.pdf",
                "original_filename": "sinclair_alyssa_2019_PROPOSAL_1.pdf",
                "metadata": {"author": "Alyssa Sinclair", "year": 2019, "funder": "NSF", "program": "Research Grant"}
            },
            {
                "document_id": "f1e5a9f7-aec3-4aae-b573-9c60a6e4b367",
                "filename": "tollerud_erik_2019_f1e5a9f7-aec3-4aae-b573-9c60a6e4b367_PROPOSAL_1.pdf",
                "original_filename": "tollerud_erik_2019_PROPOSAL_1.pdf",
                "metadata": {"author": "Erik Tollerud", "year": 2019, "funder": "NSF", "program": "Research Grant"}
            },
            {
                "document_id": "e537db5c-8e90-4844-b560-c355a5445c0b",
                "filename": "whitehead_andrew_2021_e537db5c-8e90-4844-b560-c355a5445c0b_PROPOSAL_1.pdf",
                "original_filename": "whitehead_andrew_2021_PROPOSAL_1.pdf",
                "metadata": {"author": "Andrew Whitehead", "year": 2021, "funder": "NSF", "program": "Research Grant"}
            },
            {
                "document_id": "4ba83e42-2b3d-4b9c-9eda-2e12fc44be69",
                "filename": "zhu_rebecca_2018_4ba83e42-2b3d-4b9c-9eda-2e12fc44be69_PROPOSAL_1.pdf",
                "original_filename": "zhu_rebecca_2018_PROPOSAL_1.pdf",
                "metadata": {"author": "Rebecca Zhu", "year": 2018, "funder": "NSF", "program": "Research Grant"}
            },
            # Zorowitz Sam proposals (3 documents)
            {
                "document_id": "6e80b3f1-69ca-4e67-af69-00857dc48952-1",
                "filename": "zorowitz_sam_2018_6e80b3f1-69ca-4e67-af69-00857dc48952_PROPOSAL_1.pdf",
                "original_filename": "zorowitz_sam_2018_PROPOSAL_1.pdf",
                "metadata": {"author": "Sam Zorowitz", "year": 2018, "funder": "NSF", "program": "Research Grant", "proposal_number": 1}
            },
            {
                "document_id": "6e80b3f1-69ca-4e67-af69-00857dc48952-2",
                "filename": "zorowitz_sam_2018_6e80b3f1-69ca-4e67-af69-00857dc48952_PROPOSAL_2.pdf",
                "original_filename": "zorowitz_sam_2018_PROPOSAL_2.pdf",
                "metadata": {"author": "Sam Zorowitz", "year": 2018, "funder": "NSF", "program": "Research Grant", "proposal_number": 2}
            },
            {
                "document_id": "6e80b3f1-69ca-4e67-af69-00857dc48952-3",
                "filename": "zorowitz_sam_2018_6e80b3f1-69ca-4e67-af69-00857dc48952_PROPOSAL_3.pdf",
                "original_filename": "zorowitz_sam_2018_PROPOSAL_3.pdf",
                "metadata": {"author": "Sam Zorowitz", "year": 2018, "funder": "NSF", "program": "Research Grant", "proposal_number": 3}
            }
        ]
        
        return expected_files
    
    async def check_seeding_status(self) -> Dict[str, Any]:
        """
        Check the current seeding status of the database.
        
        Returns:
            Dictionary with seeding status information
        """
        try:
            async with get_async_session() as session:
                # Count seeded documents
                result = await session.execute(
                    text("SELECT COUNT(*) FROM document_metadata WHERE upload_status = 'seeded'")
                )
                seeded_count = result.scalar()
                
                # Get total expected count
                expected_count = len(self.expected_documents)
                
                # Check if seeding is complete
                is_complete = seeded_count >= expected_count
                
                return {
                    "seeded_count": seeded_count,
                    "expected_count": expected_count,
                    "is_complete": is_complete,
                    "completion_percentage": (seeded_count / expected_count * 100) if expected_count > 0 else 0
                }
                
        except Exception as e:
            logger.error(f"Error checking seeding status: {e}")
            return {
                "seeded_count": 0,
                "expected_count": len(self.expected_documents),
                "is_complete": False,
                "completion_percentage": 0,
                "error": str(e)
            }
    
    async def seed_database(self, force_reseed: bool = False) -> Dict[str, Any]:
        """
        Seed the database with document metadata.
        
        Args:
            force_reseed: If True, reseed even if already complete
            
        Returns:
            Dictionary with seeding results
        """
        try:
            logger.info("Starting database seeding process...")
            
            # Check current status
            status = await self.check_seeding_status()
            
            if status["is_complete"] and not force_reseed:
                logger.info(f"Database already seeded with {status['seeded_count']} documents")
                return {
                    "success": True,
                    "message": "Database already seeded",
                    "seeded_count": status["seeded_count"],
                    "skipped": True
                }
            
            # Perform seeding
            seeded_count = 0
            errors = []
            
            async with get_async_session() as session:
                for doc_info in self.expected_documents:
                    try:
                        # Check if document already exists
                        existing = await session.execute(
                            text("SELECT id FROM document_metadata WHERE document_id = :doc_id"),
                            {"doc_id": doc_info["document_id"]}
                        )
                        
                        if existing.scalar() and not force_reseed:
                            continue
                        
                        # Calculate file size if file exists
                        file_path = self.seed_data_path / doc_info["filename"]
                        file_size = file_path.stat().st_size if file_path.exists() else 1024000  # Default size
                        
                        # Create document metadata entry
                        doc_metadata = DocumentMetadataDB(
                            document_id=doc_info["document_id"],
                            filename=doc_info["filename"],
                            original_filename=doc_info["original_filename"],
                            file_size=file_size,
                            mime_type="application/pdf",
                            s3_key=f"seed-data/{doc_info['filename']}",
                            upload_status="seeded",
                            text_extracted=False,
                            pdf_metadata=doc_info["metadata"],
                            processing_metadata={
                                "source": "seed_data",
                                "seeded_at": datetime.utcnow().isoformat()
                            }
                        )
                        
                        # Insert or update
                        if force_reseed:
                            await session.merge(doc_metadata)
                        else:
                            session.add(doc_metadata)
                        
                        seeded_count += 1
                        
                    except Exception as e:
                        error_msg = f"Error seeding document {doc_info['document_id']}: {e}"
                        logger.error(error_msg)
                        errors.append(error_msg)
                
                await session.commit()
            
            logger.info(f"Database seeding completed. Seeded {seeded_count} documents")
            
            return {
                "success": True,
                "message": f"Successfully seeded {seeded_count} documents",
                "seeded_count": seeded_count,
                "errors": errors,
                "skipped": False
            }
            
        except Exception as e:
            logger.error(f"Database seeding failed: {e}")
            return {
                "success": False,
                "message": f"Seeding failed: {e}",
                "seeded_count": 0,
                "errors": [str(e)],
                "skipped": False
            }
    
    async def verify_seeded_files(self) -> Dict[str, Any]:
        """
        Verify that all seeded documents have corresponding files.
        
        Returns:
            Dictionary with verification results
        """
        try:
            missing_files = []
            existing_files = []
            
            for doc_info in self.expected_documents:
                file_path = self.seed_data_path / doc_info["filename"]
                
                if file_path.exists():
                    existing_files.append({
                        "document_id": doc_info["document_id"],
                        "filename": doc_info["filename"],
                        "file_size": file_path.stat().st_size
                    })
                else:
                    missing_files.append({
                        "document_id": doc_info["document_id"],
                        "filename": doc_info["filename"],
                        "expected_path": str(file_path)
                    })
            
            return {
                "total_expected": len(self.expected_documents),
                "existing_files": len(existing_files),
                "missing_files": len(missing_files),
                "missing_file_details": missing_files,
                "existing_file_details": existing_files,
                "verification_complete": len(missing_files) == 0
            }
            
        except Exception as e:
            logger.error(f"File verification failed: {e}")
            return {
                "total_expected": len(self.expected_documents),
                "existing_files": 0,
                "missing_files": len(self.expected_documents),
                "verification_complete": False,
                "error": str(e)
            }
    
    async def get_seeded_documents(self) -> List[Dict[str, Any]]:
        """
        Get list of all seeded documents from the database.
        
        Returns:
            List of seeded document dictionaries
        """
        try:
            async with get_async_session() as session:
                result = await session.execute(
                    text("""
                        SELECT document_id, filename, original_filename, file_size, 
                               s3_key, pdf_metadata, uploaded_at
                        FROM document_metadata 
                        WHERE upload_status = 'seeded'
                        ORDER BY uploaded_at DESC
                    """)
                )
                
                documents = []
                for row in result:
                    documents.append({
                        "document_id": row.document_id,
                        "filename": row.filename,
                        "original_filename": row.original_filename,
                        "file_size": row.file_size,
                        "s3_key": row.s3_key,
                        "metadata": row.pdf_metadata or {},
                        "uploaded_at": row.uploaded_at.isoformat() if row.uploaded_at else None
                    })
                
                return documents
                
        except Exception as e:
            logger.error(f"Error retrieving seeded documents: {e}")
            return []


# Global seed manager instance
seed_manager = SeedManager()


async def initialize_seeding():
    """Initialize database seeding on startup."""
    try:
        logger.info("Initializing database seeding...")
        
        # Ensure database is initialized
        await init_database()
        
        # Check seeding status
        status = await seed_manager.check_seeding_status()
        logger.info(f"Seeding status: {status['seeded_count']}/{status['expected_count']} documents")
        
        # Perform seeding if needed
        if not status["is_complete"]:
            result = await seed_manager.seed_database()
            if result["success"]:
                logger.info(f"Database seeding completed: {result['message']}")
            else:
                logger.error(f"Database seeding failed: {result['message']}")
        else:
            logger.info("Database seeding already complete")
        
        # Verify files
        verification = await seed_manager.verify_seeded_files()
        if verification["verification_complete"]:
            logger.info(f"File verification complete: {verification['existing_files']} files found")
        else:
            logger.warning(f"File verification incomplete: {verification['missing_files']} files missing")
        
    except Exception as e:
        logger.error(f"Seeding initialization failed: {e}")


if __name__ == "__main__":
    # Run seeding when script is executed directly
    asyncio.run(initialize_seeding())