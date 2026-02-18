
import os
import sys
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

load_dotenv()

key = os.getenv("GOOGLE_API_KEY")
print(f"Key present: {bool(key)}")

try:
    llm = ChatGoogleGenerativeAI(
        model="models/gemini-pro",
        google_api_key=key,
        temperature=0.7
    )
    print("LLM initialized. Invoking...")
    res = llm.invoke([HumanMessage(content="Hi")])
    print(f"Response: {res.content}")
except Exception as e:
    print(f"Error: {e}")
