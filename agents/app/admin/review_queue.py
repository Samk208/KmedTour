"""
Human Review Queue Module
Handles flagging and storage of unsafe AI responses for human review.
Persists to Supabase 'review_queue' table for audit and compliance.
"""

from typing import List, Dict, Any, Optional
import json
import os
import httpx
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()


class ReviewQueue:
    """
    Manages the queue of responses flagged by the Medical Safety Layer.
    Persists flagged responses to Supabase for human review.
    """

    def __init__(self):
        self.supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not self.supabase_url or not self.supabase_key:
            print("[REVIEW QUEUE] ⚠️ Supabase not configured - logging to console only")
            self.enabled = False
        else:
            self.enabled = True
            self.headers = {
                "apikey": self.supabase_key,
                "Authorization": f"Bearer {self.supabase_key}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }

    def flag_for_review(
        self,
        input_messages: List[Any],
        unsafe_response: str,
        violations: List[Dict[str, Any]],
        metadata: Dict[str, Any] = None,
        session_id: str = None,
        patient_id: str = None
    ) -> Dict[str, Any]:
        """
        Add an item to the review queue.

        Args:
            input_messages: List of conversation messages (LangChain message objects)
            unsafe_response: The AI response that was flagged
            violations: List of SafetyViolation dicts from MedicalSafetyLayer
            metadata: Additional metadata (query_type, etc.)
            session_id: Optional session identifier
            patient_id: Optional patient UUID for linking

        Returns:
            Dict with the created entry or error info
        """
        # Extract message content safely
        context = []
        for msg in input_messages:
            if hasattr(msg, 'content'):
                context.append({
                    "role": getattr(msg, 'type', 'unknown'),
                    "content": msg.content[:500]  # Truncate for storage
                })

        entry = {
            "status": "pending",
            "violations": violations,
            "unsafe_response": unsafe_response[:2000],  # Truncate long responses
            "context": context,
            "query_type": metadata.get("query_type") if metadata else None,
            "session_id": session_id,
            "patient_id": patient_id,
            "metadata": metadata or {}
        }

        # Always log to console for debugging
        print(f"\n[REVIEW QUEUE] 🚩 Flagged Response:")
        print(f"  Violations: {len(violations)}")
        for v in violations[:3]:  # Show first 3 violations
            print(f"    - {v.get('type')}: {v.get('severity')} - {v.get('excerpt', '')[:50]}...")
        print(f"  Response preview: {unsafe_response[:100]}...")

        # Persist to Supabase if enabled
        if self.enabled:
            try:
                result = self._persist_to_supabase(entry)
                if result:
                    print(f"  ✅ Saved to Supabase (ID: {result.get('id', 'unknown')})")
                    return result
            except Exception as e:
                print(f"  ❌ Failed to save to Supabase: {str(e)}")

        return entry

    def _persist_to_supabase(self, entry: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Persist entry to Supabase review_queue table.

        Uses synchronous httpx for simplicity in this context.
        """
        with httpx.Client() as client:
            response = client.post(
                f"{self.supabase_url}/rest/v1/review_queue",
                headers=self.headers,
                json=entry,
                timeout=10.0
            )

            if response.status_code in [200, 201]:
                data = response.json()
                return data[0] if isinstance(data, list) and data else data
            else:
                print(f"  Supabase error: {response.status_code} - {response.text}")
                return None

    async def flag_for_review_async(
        self,
        input_messages: List[Any],
        unsafe_response: str,
        violations: List[Dict[str, Any]],
        metadata: Dict[str, Any] = None,
        session_id: str = None,
        patient_id: str = None
    ) -> Dict[str, Any]:
        """
        Async version of flag_for_review for use in async contexts.
        """
        context = []
        for msg in input_messages:
            if hasattr(msg, 'content'):
                context.append({
                    "role": getattr(msg, 'type', 'unknown'),
                    "content": msg.content[:500]
                })

        entry = {
            "status": "pending",
            "violations": violations,
            "unsafe_response": unsafe_response[:2000],
            "context": context,
            "query_type": metadata.get("query_type") if metadata else None,
            "session_id": session_id,
            "patient_id": patient_id,
            "metadata": metadata or {}
        }

        print(f"\n[REVIEW QUEUE] 🚩 Flagged Response (async):")
        print(f"  Violations: {len(violations)}")

        if self.enabled:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{self.supabase_url}/rest/v1/review_queue",
                        headers=self.headers,
                        json=entry,
                        timeout=10.0
                    )

                    if response.status_code in [200, 201]:
                        data = response.json()
                        result = data[0] if isinstance(data, list) and data else data
                        print(f"  ✅ Saved to Supabase (ID: {result.get('id', 'unknown')})")
                        return result
                    else:
                        print(f"  ❌ Supabase error: {response.status_code}")
            except Exception as e:
                print(f"  ❌ Failed to save: {str(e)}")

        return entry

    def get_pending_reviews(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Fetch pending reviews from Supabase.
        """
        if not self.enabled:
            return []

        with httpx.Client() as client:
            response = client.get(
                f"{self.supabase_url}/rest/v1/review_queue",
                headers=self.headers,
                params={
                    "status": "eq.pending",
                    "order": "created_at.desc",
                    "limit": str(limit)
                },
                timeout=10.0
            )

            if response.status_code == 200:
                return response.json()
            return []

    def update_review_status(
        self,
        review_id: str,
        status: str,
        reviewed_by: str = None,
        review_notes: str = None
    ) -> bool:
        """
        Update the status of a review item.

        Args:
            review_id: UUID of the review item
            status: New status ('approved', 'rejected', 'escalated')
            reviewed_by: UUID of the reviewer
            review_notes: Optional notes from reviewer
        """
        if not self.enabled:
            return False

        update_data = {
            "status": status,
            "reviewed_at": datetime.utcnow().isoformat()
        }

        if reviewed_by:
            update_data["reviewed_by"] = reviewed_by
        if review_notes:
            update_data["review_notes"] = review_notes

        with httpx.Client() as client:
            response = client.patch(
                f"{self.supabase_url}/rest/v1/review_queue",
                headers=self.headers,
                params={"id": f"eq.{review_id}"},
                json=update_data,
                timeout=10.0
            )

            return response.status_code == 200


# Singleton instance
review_queue = ReviewQueue()
