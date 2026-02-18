"""
Medical Safety Layer - Deterministic Rule-Based Checks
This module provides strict, rule-based safety checks for AI responses.
It is designed to be FDA-compliant (auditable, deterministic) and free of hallucinations.
"""

import re
from typing import Dict, List, Literal, Any, TypedDict

class SafetyViolation(TypedDict):
    type: Literal["medical_advice", "unverified_pricing", "accreditation_claim", "emergency_keyword"]
    severity: Literal["HIGH", "MEDIUM", "LOW"]
    excerpt: str
    action: Literal["block", "verify", "flag"]

class CheckResult(TypedDict):
    safe: bool
    violations: List[SafetyViolation]
    action: Literal["send", "block", "human_review"]

class MedicalSafetyLayer:
    """
    Deterministic safety checks for KmedTour AI agents.
    Uses regex patterns and strict logic to prevent unsafe medical advice.
    """
    
    # 1. Medical Advice Patterns (High Risk)
    MEDICAL_ADVICE_PATTERNS = [
        r"you should (take|use|try|buy)",
        r"i (recommend|suggest|advise|prescribe)",
        r"(cure|treat|fix|heal) your",
        r"dosage",
        r"take \d+ (mg|ml|pills)",
        r"diagnosis",
        r"you have",
    ]

    # 2. Pricing Claims (Medium Risk)
    PRICING_PATTERNS = [
        r"\$\d+",
        r"₩\d+",
        r"\d{1,3}(,\d{3})* (KRW|USD|EUR)",
        r"cost is",
        r"price is",
    ]

    # 3. Accreditation Claims (High Risk)
    ACCREDITATION_PATTERNS = [
        r"(JCI|KAHF|ISO).*(accredited|certified|approved)",
        r"internationally (accredited|recognized)",
        r"best (hospital|clinic|doctor)",
        r"guaranteed (success|results)",
    ]
    
    # 4. Emergency Keywords (Critical Risk)
    EMERGENCY_PATTERNS = [
        r"suicide",
        r"kill myself",
        r"chest pain",
        r"severe bleeding",
        r"heart attack",
        r"stroke",
        r"difficulty breathing"
    ]

    def check_response(
        self, 
        response: str, 
        query_type: Literal["faq", "medical_info", "emergency", "human"]
    ) -> CheckResult:
        """
        Main entry point for safety checks.
        """
        violations: List[SafetyViolation] = []
        response_lower = response.lower()

        if query_type == "emergency":
             return {"safe": True, "violations": [], "action": "send"}

        # CHECK 1: Emergency Keywords in non-emergency response
        for pattern in self.EMERGENCY_PATTERNS:
            if re.search(pattern, response_lower):
                violations.append({
                    "type": "emergency_keyword",
                    "severity": "HIGH",
                    "excerpt": self._extract_violation(response, pattern),
                    "action": "block"
                })

        # CHECK 2: Direct Medical Advice
        for pattern in self.MEDICAL_ADVICE_PATTERNS:
            if re.search(pattern, response_lower):
                # Exception: "I cannot recommend" is safe
                if "cannot" in response_lower or "not" in response_lower:
                    if re.search(r"(cannot|not) (recommend|suggest|advise)", response_lower):
                        continue
                
                violations.append({
                    "type": "medical_advice",
                    "severity": "HIGH",
                    "excerpt": self._extract_violation(response, pattern),
                    "action": "block"
                })

        # CHECK 3: Pricing and Accreditation
        for pattern in self.PRICING_PATTERNS:
            if re.search(pattern, response_lower):
                violations.append({
                    "type": "unverified_pricing",
                    "severity": "MEDIUM",
                    "excerpt": self._extract_violation(response, pattern),
                    "action": "flag"
                })

        for pattern in self.ACCREDITATION_PATTERNS:
            if re.search(pattern, response_lower):
                violations.append({
                    "type": "accreditation_claim",
                    "severity": "MEDIUM",
                    "excerpt": self._extract_violation(response, pattern),
                    "action": "flag"
                })

        # Determine Final Action
        action: Literal["send", "block", "human_review"] = "send"
        
        if any(v["severity"] == "HIGH" for v in violations):
            action = "block"
            return {"safe": False, "violations": violations, "action": action}

        if any(v["severity"] == "MEDIUM" for v in violations):
            action = "human_review"
            return {"safe": True, "violations": violations, "action": action}

        return {"safe": True, "violations": [], "action": "send"}

    def _extract_violation(self, text: str, pattern: str) -> str:
        sentences = text.split('.')
        for sentence in sentences:
            if re.search(pattern, sentence, re.IGNORECASE):
                return sentence.strip()
        return "Pattern match found"
