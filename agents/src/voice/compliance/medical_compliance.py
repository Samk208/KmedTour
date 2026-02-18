from datetime import datetime, timedelta
from typing import Dict, Optional, List
from enum import Enum

class VoiceIntent(Enum):
    GREETING = "greeting"
    HOURS = "hours"
    LOCATION = "location"
    PRICING_GENERAL = "pricing_general"
    HUMAN_HANDOFF = "human_handoff"
    EMERGENCY = "emergency"
    MEDICAL_QUERY = "medical_query"
    SCHEDULING = "scheduling"
    UNKNOWN = "unknown"

class MedicalVoiceCompliance:
    """
    HIPAA Compliance Gate for Voice Agents.
    Ensures no PHI (Protected Health Information) is processed 
    without an active, verified session.
    """
    
    # Intents that require identity verification
    SENSITIVE_INTENTS = {
        VoiceIntent.MEDICAL_QUERY,
        VoiceIntent.SCHEDULING,
        VoiceIntent.PRICING_GENERAL, # Often implies specific treatment interest
    }

    def __init__(self):
        # In-memory session store (replace with Redis/Db in scaled production)
        self.verified_sessions: Dict[str, Dict] = {}

    def verify_session(self, session_id: str, patient_data: Dict) -> bool:
        """
        Mark a session as verified after successful authentication.
        expiration: 15 minutes rolling window
        """
        self.verified_sessions[session_id] = {
            "verified_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(minutes=15),
            "patient_id": patient_data.get("id"),
            "role": patient_data.get("role", "patient")
        }
        return True

    def is_session_valid(self, session_id: str) -> bool:
        """Check if session exists and is not expired."""
        session = self.verified_sessions.get(session_id)
        if not session:
            return False
        
        if datetime.utcnow() > session["expires_at"]:
            del self.verified_sessions[session_id]
            return False
            
        # Rolling window: Extend session on activity
        session["expires_at"] = datetime.utcnow() + timedelta(minutes=15)
        return True

    def check_compliance(self, intent: VoiceIntent, text: str, session_id: str) -> Dict:
        """
        Main Guardrail:
        Returns { "allowed": bool, "action": str, "reason": str }
        """
        
        # 1. EMERGENCY OVERRIDE (Always Priority 0)
        # We process emergency logic regardless of auth, but strictly for escalation.
        if intent == VoiceIntent.EMERGENCY:
            return {
                "allowed": True, 
                "action": "escalate_emergency",
                "reason": "emergency_override"
            }

        # 2. Public Information Check (No Auth Needed)
        if intent not in self.SENSITIVE_INTENTS:
            return {
                "allowed": True,
                "action": "proceed_public",
                "reason": "public_info"
            }

        # 3. Sensitive Data Gate (Auth Required)
        if self.is_session_valid(session_id):
            return {
                "allowed": True,
                "action": "proceed_sensitive",
                "reason": "verified_session"
            }
        else:
            return {
                "allowed": False,
                "action": "request_verification",
                "reason": "phi_protection_required"
            }

    def scrub_text(self, text: str) -> str:
        """
        Basic regex scrubber for logs.
        (Implementation tbd - placeholder for now)
        """
        return text
