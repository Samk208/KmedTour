"""
RAG Seeding Script for KmedTour

Seeds the rag_documents and rag_chunks tables with treatments and clinics data.
Uses Gemini text-embedding-004 for embeddings (768 dimensions).

Table schema (from 008_missing_tables.sql):
- rag_documents: id (uuid), title, source_url, source_type, content_hash, metadata, is_active
- rag_chunks: id (uuid), document_id, chunk_index, content, embedding (vector 768), token_count, metadata

Usage:
    python agents/scripts/seed_rag.py

Requires:
    - NEXT_PUBLIC_SUPABASE_URL
    - SUPABASE_SERVICE_ROLE_KEY
    - GEMINI_API_KEY
"""

import os
import sys
import json
import httpx
import hashlib
import uuid
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load environment from .env.local
env_path = Path(__file__).parent.parent.parent / ".env.local"
load_dotenv(env_path)

# Configuration
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY]):
    print("Error: Missing required environment variables")
    print(f"  NEXT_PUBLIC_SUPABASE_URL: {'set' if SUPABASE_URL else 'missing'}")
    print(f"  SUPABASE_SERVICE_ROLE_KEY: {'set' if SUPABASE_KEY else 'missing'}")
    print(f"  GEMINI_API_KEY: {'set' if GEMINI_API_KEY else 'missing'}")
    sys.exit(1)

# Supabase REST API headers
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Gemini embedding endpoint
GEMINI_EMBED_URL = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={GEMINI_API_KEY}"


def generate_embedding(text: str) -> list[float]:
    """Generate embedding using Gemini text-embedding-004 (768 dimensions)."""
    payload = {
        "model": "models/text-embedding-004",
        "content": {
            "parts": [{"text": text}]
        }
    }

    with httpx.Client(timeout=30.0) as client:
        response = client.post(GEMINI_EMBED_URL, json=payload)

        if response.status_code != 200:
            print(f"Embedding API error: {response.status_code}")
            print(response.text)
            raise Exception(f"Failed to generate embedding: {response.status_code}")

        data = response.json()
        embedding = data["embedding"]["values"]
        return embedding


def generate_deterministic_uuid(seed: str) -> str:
    """Generate a deterministic UUID from a seed string."""
    hash_bytes = hashlib.md5(seed.encode()).digest()
    return str(uuid.UUID(bytes=hash_bytes))


def create_document(doc_type: str, title: str, content: str, metadata: dict, source_id: str) -> Optional[str]:
    """
    Create a document in rag_documents table.

    Table schema:
    - id: uuid (primary key)
    - title: text
    - source_url: text (we store source_id here)
    - source_type: text (we store doc_type here: 'treatment' or 'clinic')
    - content_hash: text (for deduplication)
    - metadata: jsonb
    - is_active: boolean
    """
    # Generate deterministic UUID based on source
    doc_id = generate_deterministic_uuid(f"{doc_type}:{source_id}")

    # Generate content hash for deduplication
    content_hash = hashlib.sha256(content.encode()).hexdigest()[:16]

    payload = {
        "id": doc_id,
        "title": title,
        "source_url": f"/{doc_type}/{source_id}",  # Store reference path
        "source_type": doc_type,  # 'treatment' or 'clinic'
        "content_hash": content_hash,
        "metadata": {
            **metadata,
            "original_source_id": source_id,
            "content_preview": content[:200]
        },
        "is_active": True
    }

    with httpx.Client(timeout=30.0) as client:
        # Use upsert to handle re-runs (conflict on id)
        response = client.post(
            f"{SUPABASE_URL}/rest/v1/rag_documents",
            headers={**HEADERS, "Prefer": "resolution=merge-duplicates,return=representation"},
            json=payload
        )

        if response.status_code not in [200, 201]:
            print(f"Error creating document: {response.status_code}")
            print(response.text)
            return None

        result = response.json()
        return result[0]["id"] if result else doc_id


def create_chunk(document_id: str, chunk_index: int, content: str, embedding: list[float]) -> bool:
    """
    Create a chunk in rag_chunks table.

    Table schema:
    - id: uuid (primary key)
    - document_id: uuid (foreign key)
    - chunk_index: integer
    - content: text
    - embedding: vector(768)
    - token_count: integer
    - metadata: jsonb
    """
    # Generate deterministic chunk UUID
    chunk_id = generate_deterministic_uuid(f"{document_id}:{chunk_index}")

    # Estimate token count (rough approximation: ~4 chars per token)
    token_count = len(content) // 4

    payload = {
        "id": chunk_id,
        "document_id": document_id,
        "chunk_index": chunk_index,
        "content": content,
        "embedding": embedding,
        "token_count": token_count,
        "metadata": {}
    }

    with httpx.Client(timeout=30.0) as client:
        response = client.post(
            f"{SUPABASE_URL}/rest/v1/rag_chunks",
            headers={**HEADERS, "Prefer": "resolution=merge-duplicates,return=representation"},
            json=payload
        )

        if response.status_code not in [200, 201]:
            print(f"Error creating chunk: {response.status_code}")
            print(response.text)
            return False

        return True


def chunk_text(text: str, max_chunk_size: int = 500) -> list[str]:
    """Split text into chunks for embedding."""
    # For short texts, return as single chunk
    if len(text) <= max_chunk_size:
        return [text]

    # Split by sentences/paragraphs
    chunks = []
    current_chunk = ""

    sentences = text.replace(". ", ".|").replace("! ", "!|").replace("? ", "?|").split("|")

    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= max_chunk_size:
            current_chunk += sentence + " "
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence + " "

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks if chunks else [text]


def format_treatment_content(treatment: dict) -> str:
    """Format treatment data into text for embedding."""
    highlights = ", ".join(treatment.get("highlights", []))

    content = f"""Treatment: {treatment['title']}
Category: {treatment.get('category', 'General')}
Description: {treatment.get('description', '')}
Price Range: {treatment.get('priceRange', 'Contact for pricing')}
Duration: {treatment.get('duration', 'Varies')}
Success Rate: {treatment.get('successRate', 'High')}
Keywords: {highlights}

This {treatment['title']} procedure is available in South Korea with world-class medical facilities.
The estimated cost is {treatment.get('priceRange', 'available upon consultation')} with a typical stay of {treatment.get('duration', 'varies based on procedure')}.
"""
    return content


def format_clinic_content(clinic: dict) -> str:
    """Format clinic data into text for embedding."""
    specialties = ", ".join(clinic.get("specialties", []))
    languages = ", ".join(clinic.get("languagesSupported", []))
    accreditations = ", ".join(clinic.get("accreditations", [])) if clinic.get("accreditations") else "Contact for accreditation details"

    content = f"""Clinic: {clinic['name']}
Location: {clinic.get('location', 'South Korea')}
Description: {clinic.get('description', '')}
Specialties: {specialties if specialties else 'Multiple specialties'}
Languages Supported: {languages if languages else 'English'}
Accreditations: {accreditations}
International Patients: {clinic.get('internationalPatients', 'Yes')}

{clinic['name']} is located in {clinic.get('location', 'South Korea')} and provides services for international medical tourists.
The facility offers {specialties if specialties else 'comprehensive medical services'} with support in {languages if languages else 'English'}.
"""
    return content


def seed_treatments():
    """Seed treatments into RAG tables."""
    print("\n=== Seeding Treatments ===")

    treatments_path = Path(__file__).parent.parent.parent / "lib" / "data" / "treatments.json"

    with open(treatments_path, "r", encoding="utf-8") as f:
        treatments = json.load(f)

    print(f"Found {len(treatments)} treatments")

    success_count = 0
    error_count = 0

    for i, treatment in enumerate(treatments):
        try:
            # Create document
            content = format_treatment_content(treatment)
            metadata = {
                "slug": treatment.get("slug"),
                "category": treatment.get("category"),
                "priceRange": treatment.get("priceRange"),
                "duration": treatment.get("duration"),
                "highlights": treatment.get("highlights", [])
            }

            doc_id = create_document(
                doc_type="treatment",
                title=treatment["title"],
                content=content,
                metadata=metadata,
                source_id=treatment["id"]
            )

            if not doc_id:
                error_count += 1
                continue

            # Chunk and embed
            chunks = chunk_text(content)

            for chunk_idx, chunk_content in enumerate(chunks):
                embedding = generate_embedding(chunk_content)

                if not create_chunk(doc_id, chunk_idx, chunk_content, embedding):
                    print(f"  Warning: Failed to create chunk {chunk_idx} for {treatment['title']}")

            success_count += 1

            if (i + 1) % 10 == 0:
                print(f"  Processed {i + 1}/{len(treatments)} treatments...")

        except Exception as e:
            print(f"  Error processing treatment {treatment.get('title', 'unknown')}: {e}")
            error_count += 1

    print(f"\nTreatments completed: {success_count} success, {error_count} errors")
    return success_count, error_count


def seed_clinics():
    """Seed clinics into RAG tables."""
    print("\n=== Seeding Clinics ===")

    clinics_path = Path(__file__).parent.parent.parent / "lib" / "data" / "clinics.json"

    with open(clinics_path, "r", encoding="utf-8") as f:
        clinics = json.load(f)

    print(f"Found {len(clinics)} clinics")

    success_count = 0
    error_count = 0

    for i, clinic in enumerate(clinics):
        try:
            # Create document
            content = format_clinic_content(clinic)
            metadata = {
                "slug": clinic.get("slug"),
                "location": clinic.get("location"),
                "specialties": clinic.get("specialties", []),
                "languagesSupported": clinic.get("languagesSupported", []),
                "accreditations": clinic.get("accreditations", [])
            }

            doc_id = create_document(
                doc_type="clinic",
                title=clinic["name"],
                content=content,
                metadata=metadata,
                source_id=clinic["id"]
            )

            if not doc_id:
                error_count += 1
                continue

            # Chunk and embed
            chunks = chunk_text(content)

            for chunk_idx, chunk_content in enumerate(chunks):
                embedding = generate_embedding(chunk_content)

                if not create_chunk(doc_id, chunk_idx, chunk_content, embedding):
                    print(f"  Warning: Failed to create chunk {chunk_idx} for {clinic['name']}")

            success_count += 1

            if (i + 1) % 10 == 0:
                print(f"  Processed {i + 1}/{len(clinics)} clinics...")

        except Exception as e:
            print(f"  Error processing clinic {clinic.get('name', 'unknown')}: {e}")
            error_count += 1

    print(f"\nClinics completed: {success_count} success, {error_count} errors")
    return success_count, error_count


def verify_seeding():
    """Verify the seeding by checking document and chunk counts."""
    print("\n=== Verification ===")

    with httpx.Client(timeout=30.0) as client:
        # Count documents
        response = client.get(
            f"{SUPABASE_URL}/rest/v1/rag_documents?select=id,source_type",
            headers=HEADERS
        )

        if response.status_code == 200:
            docs = response.json()
            treatments = len([d for d in docs if d["source_type"] == "treatment"])
            clinics = len([d for d in docs if d["source_type"] == "clinic"])
            print(f"  Documents: {len(docs)} total ({treatments} treatments, {clinics} clinics)")

        # Count chunks
        response = client.get(
            f"{SUPABASE_URL}/rest/v1/rag_chunks?select=id",
            headers=HEADERS
        )

        if response.status_code == 200:
            chunks = response.json()
            print(f"  Chunks: {len(chunks)} total")


def main():
    """Main entry point."""
    print("=" * 50)
    print("KmedTour RAG Seeding Script")
    print("=" * 50)
    print(f"\nSupabase URL: {SUPABASE_URL}")
    print(f"Embedding Model: Gemini text-embedding-004 (768 dims)")

    # Test embedding API
    print("\nTesting Gemini embedding API...")
    try:
        test_embedding = generate_embedding("test")
        print(f"  Embedding test successful: {len(test_embedding)} dimensions")
    except Exception as e:
        print(f"  Embedding test failed: {e}")
        sys.exit(1)

    # Seed data
    t_success, t_errors = seed_treatments()
    c_success, c_errors = seed_clinics()

    # Verify
    verify_seeding()

    # Summary
    print("\n" + "=" * 50)
    print("SEEDING COMPLETE")
    print("=" * 50)
    print(f"Treatments: {t_success} success, {t_errors} errors")
    print(f"Clinics: {c_success} success, {c_errors} errors")

    if t_errors > 0 or c_errors > 0:
        print("\nSome errors occurred. Check the output above for details.")
        sys.exit(1)
    else:
        print("\nAll documents seeded successfully!")


if __name__ == "__main__":
    main()
