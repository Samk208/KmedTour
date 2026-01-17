# Quick Start - Test Your AI Agent Now!

## Step 1: Install Python Dependencies (First Time Only)

Open PowerShell or Terminal in the `agents` folder:

```bash
# Navigate to agents folder
cd "C:\Users\Lenovo\Desktop\Workspce\KmedTour Now\agents"

# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

This will take 2-3 minutes to install all packages.

## Step 2: Test the Agent

```bash
# Make sure you're in the agents folder and venv is activated
python test_agent.py
```

**Expected output**:
```
🔑 Testing Gemini API key...
   ✅ API key found: AIzaSyAVIqlYny8UkXj9...

📦 Testing imports...
   ✅ langchain_google_genai imported
   ✅ langgraph imported

🌐 Testing Gemini connection...
   ✅ Gemini responded: Hello from KmedTour AI!...

🤖 Testing LangGraph agent...
   ✅ Agent imported successfully

   📝 Sending test query: 'What is rhinoplasty?'
   ⏳ Waiting for response (may take 2-5 seconds)...

   ✅ Agent Response:
   ======================================================================
   ⚠️ **MEDICAL DISCLAIMER**
   I provide general information only and am NOT a substitute for...

   Rhinoplasty, commonly known as a nose job, is a surgical procedure...
   ======================================================================

   ✅ Medical disclaimer present

======================================================================
✅ ALL TESTS PASSED!
======================================================================

🚀 Your AI agent is working! Ready to start the API server.
```

## Step 3: Start the API Server

```bash
# Option A: Using the start script
start.bat

# Option B: Manual start
python -m app.main
```

**Expected output**:
```
🚀 KmedTour AI Agents Server Starting...

📡 Server: http://0.0.0.0:8000
📚 Docs: http://0.0.0.0:8000/docs
🔧 Health: http://0.0.0.0:8000/health

💰 Cost Estimate: ~$5-20/month with Gemini Flash
```

## Step 4: Test the API

Open a NEW terminal/PowerShell window:

```bash
# Test health endpoint
curl http://localhost:8000/health
```

**Expected response**:
```json
{
  "status": "healthy",
  "services": {
    "api": "running",
    "langgraph": "initialized",
    "gemini": "connected"
  }
}
```

### Test chat endpoint:

```bash
curl -X POST http://localhost:8000/api/chat -H "Content-Type: application/json" -d "{\"messages\": [{\"role\": \"user\", \"content\": \"What is LASIK?\"}]}"
```

## Step 5: View API Documentation

Open your browser: **http://localhost:8000/docs**

Here you can:
- See all API endpoints
- Test API calls interactively
- View request/response schemas

---

## Troubleshooting

### "pip: command not found"
**Solution**: Make sure Python is installed. Run `python --version`

### "Module not found" errors
**Solution**: Activate virtual environment first:
```bash
venv\Scripts\activate
pip install -r requirements.txt
```

### "Port 8000 already in use"
**Solution**: Change port in `.env`:
```
API_PORT=8001
```

### Gemini API errors
**Solution**: Check your API key at https://aistudio.google.com/app/apikey

---

## What's Next?

1. ✅ **Integrate with Next.js** - Create chatbot widget component
2. ✅ **Add semantic caching** - Reduce costs by 30-70%
3. ✅ **Add RAG knowledge base** - Embed hospital/procedure data
4. ✅ **Deploy to Contabo VPS** - Make it publicly accessible

---

**You're all set!** 🎉

The AI agent is running and costs ~$0.0001 per request with Gemini Flash!
