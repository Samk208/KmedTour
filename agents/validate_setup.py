import os
from dotenv import load_dotenv

from pathlib import Path

# Load env variables from ../.env.local
env_path = Path(__file__).parent.parent / '.env.local'
load_dotenv(dotenv_path=env_path)

def test_api_key():
    key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY") or os.getenv("GEMINI_API_KEY")
    if key:
        print(f"✅ API Key found: {key[:5]}...{key[-5:]}")
        return True
    else:
        print("❌ No GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY found.")
        return False

if __name__ == "__main__":
    test_api_key()
