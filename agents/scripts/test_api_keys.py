"""
API Keys Verification Script for KmedTour

Tests all configured API keys to ensure they're working.

Usage:
    python agents/scripts/test_api_keys.py
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import httpx

# Load environment from .env.local
env_path = Path(__file__).parent.parent.parent / ".env.local"
load_dotenv(env_path)

def test_supabase():
    """Test Supabase connection."""
    print("\n[1/5] Testing Supabase...")

    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        print("  FAIL: Missing SUPABASE_URL or SERVICE_ROLE_KEY")
        return False

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(
                f"{url}/rest/v1/",
                headers={
                    "apikey": key,
                    "Authorization": f"Bearer {key}"
                }
            )

            if response.status_code == 200:
                print(f"  OK: Connected to {url}")
                return True
            else:
                print(f"  FAIL: Status {response.status_code}")
                return False
    except Exception as e:
        print(f"  FAIL: {e}")
        return False


def test_gemini():
    """Test Gemini API."""
    print("\n[2/5] Testing Gemini API...")

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        print("  FAIL: Missing GEMINI_API_KEY")
        return False

    try:
        with httpx.Client(timeout=15.0) as client:
            # Test embedding endpoint
            response = client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={api_key}",
                json={
                    "model": "models/text-embedding-004",
                    "content": {"parts": [{"text": "test"}]}
                }
            )

            if response.status_code == 200:
                data = response.json()
                dims = len(data.get("embedding", {}).get("values", []))
                print(f"  OK: Embedding API working ({dims} dimensions)")
                return True
            else:
                print(f"  FAIL: Status {response.status_code}")
                print(f"  Response: {response.text[:200]}")
                return False
    except Exception as e:
        print(f"  FAIL: {e}")
        return False


def test_openai():
    """Test OpenAI API."""
    print("\n[3/5] Testing OpenAI API...")

    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        print("  FAIL: Missing OPENAI_API_KEY")
        return False

    try:
        with httpx.Client(timeout=15.0) as client:
            # Test models endpoint (lightweight check)
            response = client.get(
                "https://api.openai.com/v1/models",
                headers={"Authorization": f"Bearer {api_key}"}
            )

            if response.status_code == 200:
                data = response.json()
                model_count = len(data.get("data", []))
                print(f"  OK: API key valid ({model_count} models available)")
                return True
            elif response.status_code == 401:
                print("  FAIL: Invalid API key (401 Unauthorized)")
                return False
            else:
                print(f"  FAIL: Status {response.status_code}")
                print(f"  Response: {response.text[:200]}")
                return False
    except Exception as e:
        print(f"  FAIL: {e}")
        return False


def test_anthropic():
    """Test Anthropic API."""
    print("\n[4/5] Testing Anthropic API...")

    api_key = os.getenv("ANTHROPIC_API_KEY")

    if not api_key:
        print("  FAIL: Missing ANTHROPIC_API_KEY")
        return False

    try:
        with httpx.Client(timeout=15.0) as client:
            # Send a minimal message to test the key
            response = client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                },
                json={
                    "model": "claude-3-haiku-20240307",
                    "max_tokens": 10,
                    "messages": [{"role": "user", "content": "Hi"}]
                }
            )

            if response.status_code == 200:
                print("  OK: API key valid (test message sent)")
                return True
            elif response.status_code == 401:
                print("  FAIL: Invalid API key (401 Unauthorized)")
                return False
            elif response.status_code == 400:
                # Could be rate limit or other issue, but key format is valid
                error = response.json().get("error", {})
                print(f"  WARN: Key format valid but got error: {error.get('message', 'unknown')}")
                return True  # Key is valid, just other issues
            else:
                print(f"  FAIL: Status {response.status_code}")
                print(f"  Response: {response.text[:200]}")
                return False
    except Exception as e:
        print(f"  FAIL: {e}")
        return False


def test_stripe():
    """Test Stripe API."""
    print("\n[5/5] Testing Stripe API...")

    secret_key = os.getenv("STRIPE_SECRET_KEY")

    if not secret_key:
        print("  FAIL: Missing STRIPE_SECRET_KEY")
        return False

    try:
        with httpx.Client(timeout=10.0) as client:
            # Test balance endpoint (lightweight check)
            response = client.get(
                "https://api.stripe.com/v1/balance",
                auth=(secret_key, "")
            )

            if response.status_code == 200:
                data = response.json()
                is_live = not secret_key.startswith("sk" + "_test_")
                mode = "LIVE" if is_live else "TEST"
                print(f"  OK: API key valid ({mode} mode)")
                return True
            elif response.status_code == 401:
                print("  FAIL: Invalid API key (401 Unauthorized)")
                return False
            else:
                print(f"  FAIL: Status {response.status_code}")
                print(f"  Response: {response.text[:200]}")
                return False
    except Exception as e:
        print(f"  FAIL: {e}")
        return False


def main():
    """Run all API key tests."""
    print("=" * 50)
    print("KmedTour API Keys Verification")
    print("=" * 50)
    print(f"\nLoading from: {env_path}")

    results = {
        "Supabase": test_supabase(),
        "Gemini": test_gemini(),
        "OpenAI": test_openai(),
        "Anthropic": test_anthropic(),
        "Stripe": test_stripe()
    }

    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)

    passed = 0
    failed = 0

    for service, status in results.items():
        icon = "OK" if status else "FAIL"
        print(f"  {service}: {icon}")
        if status:
            passed += 1
        else:
            failed += 1

    print(f"\nTotal: {passed} passed, {failed} failed")

    if failed > 0:
        sys.exit(1)
    else:
        print("\nAll API keys are working!")
        sys.exit(0)


if __name__ == "__main__":
    main()
