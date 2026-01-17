# KmedTour AI Agents - Local Setup

Budget-friendly AI chatbot system using LangGraph + Gemini Flash

**Monthly Cost**: $5-20 (Gemini API only)
**Infrastructure**: $0 (runs locally in Docker)

---

## Quick Start

### 1. Start Docker Infrastructure

```bash
# From project root
cd "C:\Users\Lenovo\Desktop\Workspce\KmedTour Now"

# Start PostgreSQL, Redis, Qdrant
docker compose up -d

# Verify all containers running
docker ps
```

### 2. Install Python Dependencies

```bash
# Navigate to agents folder
cd agents

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment

The `.env` file is already created with your API keys. Verify it contains:

```
GOOGLE_API_KEY=AIzaSyAVIqlYny8UkXj9NHFovbJ5pvrDFY7-rFc
DATABASE_URL=postgresql://kmedtour_admin:kmedtour_secure_password_2026@localhost:5432/kmedtour
REDIS_URL=redis://:redis_secure_password_2026@localhost:6379
QDRANT_URL=http://localhost:6333
```

### 4. Test the Agent

```bash
# Test LangGraph agent directly
python -m app.core.graph

# Should output a test response about rhinoplasty
```

### 5. Start API Server

```bash
# Start FastAPI server
python -m app.main

# Server runs at: http://localhost:8000
# API docs at: http://localhost:8000/docs
```

### 6. Test API Endpoint

```bash
# Test chat endpoint
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"messages\": [{\"role\": \"user\", \"content\": \"What is rhinoplasty?\"}]}"
```

---

## Architecture

```
User Query → FastAPI → LangGraph Router → Agent Selection
                                  ├─ FAQ Agent (simple questions)
                                  ├─ Medical Info Agent (detailed procedure info)
                                  ├─ Emergency Escalation (emergency keywords)
                                  └─ Human Escalation (medical advice requests)
```

### Agent Routing Logic

| Query Type | Agent Used | Example |
|------------|------------|---------|
| General FAQ | `faq_agent` | "How much does LASIK cost?" |
| Procedure Details | `medical_info_agent` | "How does rhinoplasty surgery work?" |
| Emergency | `emergency` | "I have chest pain" |
| Medical Advice | `human` | "Should I get this surgery?" |

---

## Cost Breakdown

**Gemini Flash Pricing**:
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens

**Example**: 1,000 conversations/month (5 turns each, 500 tokens avg)
- Total tokens: 1,000 × 5 × 500 = 2.5M tokens
- Cost: 2.5M × $0.075/1M = **$0.19/month** (basically free!)

**For 10,000 conversations/month**: ~$2-5/month

---

## Next Steps

### 1. Add Semantic Caching (Optional)
Reduce API costs by 30-70% with Redis caching

### 2. Add RAG Knowledge Base (Recommended)
- Embed hospital/procedure data into Qdrant
- Retrieve relevant information for each query
- Provide accurate, grounded responses

### 3. Integrate with Next.js Frontend
- Create chatbot widget component
- Connect to FastAPI backend
- Deploy chatbot on all pages

### 4. Deploy to Contabo VPS
- Copy code to VPS
- Run Docker Compose
- Configure nginx reverse proxy
- Point domain to VPS

---

## Troubleshooting

### Docker containers won't start
```bash
# Check Docker is running
docker ps

# Restart Docker Desktop
# Then retry: docker compose up -d
```

### "Module not found" errors
```bash
# Make sure virtual environment is activated
venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Gemini API errors
```bash
# Verify API key in .env
cat .env | grep GOOGLE_API_KEY

# Test API key at: https://aistudio.google.com/app/apikey
```

### Port already in use
```bash
# Change port in .env
API_PORT=8001

# Or kill process using port 8000
# Windows: netstat -ano | findstr :8000
# Then: taskkill /PID <PID> /F
```

---

## File Structure

```
agents/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI server
│   └── core/
│       ├── __init__.py
│       └── graph.py         # LangGraph multi-agent system
├── .env                     # Environment variables (API keys)
├── requirements.txt         # Python dependencies
├── checkpoints.db           # LangGraph conversation memory (auto-created)
└── README.md               # This file
```

---

## API Documentation

Once server is running, visit:
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

### Example API Call

**Request**:
```json
POST /api/chat
{
  "messages": [
    {"role": "user", "content": "What is rhinoplasty?"}
  ],
  "session_id": "user-123"
}
```

**Response**:
```json
{
  "session_id": "user-123",
  "response": "⚠️ MEDICAL DISCLAIMER...\n\nRhinoplasty is...",
  "agent_used": "medical_info_agent"
}
```

---

## Support

- **Documentation**: See AI-AGENTS-STRATEGY-LOCAL-BUDGET.md in project root
- **Issues**: Create issue in GitHub repo
- **Questions**: Contact dev team

---

**Status**: ✅ Ready for local development
**Next**: Test locally, then deploy to Contabo VPS
