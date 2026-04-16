# KmedTour Python Agent — Deployment Notes

**Target:** Contabo VPS at `62.84.185.148`  
**Port:** `8001` (external) → `8000` (container internal)  
**After deployment:** Set `PYTHON_AGENT_URL=http://62.84.185.148:8001` in Netlify env vars

---

## Required Environment Variables

Create a `.env` file in the `agents/` directory with these variables before deploying.  
**NEVER commit `.env` to git.**

### 1. AI / LLM Keys

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `GOOGLE_API_KEY` | Gemini 1.5 Flash API key (primary LLM, ~$0.0001/req) | console.cloud.google.com → APIs & Services → Credentials |
| `OPENAI_API_KEY` | OpenAI fallback (if Gemini unavailable) | platform.openai.com/api-keys |

### 2. Supabase (for RAG knowledge base access)

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `SUPABASE_URL` | Project URL (e.g. `https://xxxx.supabase.co`) | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_KEY` | **Service role key** (full access, not anon key) | Supabase Dashboard → Project Settings → API → service_role |

> ⚠️ Use the SERVICE role key (not anon key) — the agent needs to query embeddings tables directly.

### 3. Application Config

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_ENV` | Deployment environment | `production` |
| `LOG_LEVEL` | Logging verbosity (`DEBUG`, `INFO`, `WARNING`) | `INFO` |
| `MAX_HISTORY_MESSAGES` | How many past messages to include in context | `10` |
| `RATE_LIMIT_PER_MINUTE` | Max chat requests per user per minute | `30` |
| `ALLOWED_ORIGINS` | CORS allowed origins (Netlify URL) | `https://kmedtour.netlify.app,http://localhost:3000` |

### 4. Optional (if agent uses these services)

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Upstash Redis for rate limiting (e.g. `rediss://default:token@host:port`) |
| `LANGSMITH_API_KEY` | LangSmith tracing for LangGraph observability |
| `LANGSMITH_PROJECT` | LangSmith project name (e.g. `kmedtour-agent`) |

---

## Example `.env` File

```env
# AI Keys
GOOGLE_API_KEY=AIzaSy...
OPENAI_API_KEY=sk-proj-...

# Supabase
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...

# App Config
APP_ENV=production
LOG_LEVEL=INFO
MAX_HISTORY_MESSAGES=10
RATE_LIMIT_PER_MINUTE=30
ALLOWED_ORIGINS=https://kmedtour.netlify.app,http://localhost:3000

# Optional
# REDIS_URL=rediss://default:...@...upstash.io:6379
# LANGSMITH_API_KEY=lsv2_...
# LANGSMITH_PROJECT=kmedtour-agent
```

---

## VPS Prerequisites (One-Time Setup)

Run these on the Contabo VPS before first deploy:

```bash
# SSH into VPS
ssh root@62.84.185.148

# Install Docker (if not already installed)
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Create app directory
mkdir -p /opt/kmedtour/logs

# Open firewall port 8001
ufw allow 8001/tcp
# Or via iptables:
iptables -A INPUT -p tcp --dport 8001 -j ACCEPT

# Verify Docker works
docker --version
docker ps
```

---

## Deploy Steps (Quick Reference)

```bash
# From agents/ directory in your local KmedTour repo:

# 1. Create .env with all required keys (see above)
cp .env.example .env
nano .env  # Fill in your keys

# 2. Make deploy script executable
chmod +x deploy-contabo.sh

# 3. Deploy
./deploy-contabo.sh

# 4. Verify health
curl http://62.84.185.148:8001/health
# Expected: {"status": "ok", "version": "..."}

# 5. Set Netlify env var
# In Netlify Dashboard → Site Settings → Environment Variables:
# PYTHON_AGENT_URL = http://62.84.185.148:8001
```

---

## Monitoring Commands

```bash
# View live logs
ssh root@62.84.185.148 'docker logs -f kmedtour-agent'

# Check container status
ssh root@62.84.185.148 'docker ps | grep kmedtour'

# Restart container (if stuck)
ssh root@62.84.185.148 'docker restart kmedtour-agent'

# Check resource usage
ssh root@62.84.185.148 'docker stats kmedtour-agent --no-stream'

# Shell into container for debugging
ssh root@62.84.185.148 'docker exec -it kmedtour-agent /bin/bash'
```

---

## Verify Chatbot Is Using Agent (Not Fallback)

After deployment, open the live chat on https://kmedtour.netlify.app/en and ask:

> "What is the average cost of LASIK eye surgery in Seoul?"

A response using the **RAG agent** will:
- Include specific hospital names or procedure data
- Cite source documents or hospital names
- Be more detailed than generic AI responses

A **fallback response** (agent not connected) will:
- Be generic ("Medical costs vary...")
- Not mention specific Korean hospitals
- Have no citation references

---

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| `curl: Connection refused` on port 8001 | Container not running or firewall blocking | Run `docker ps` on VPS; check `ufw status` |
| Container exits immediately | Missing env vars | Run `docker logs kmedtour-agent` to see error |
| `CORS error` in browser console | ALLOWED_ORIGINS not set correctly | Add Netlify URL to ALLOWED_ORIGINS in .env |
| Slow responses (>10s) | Gemini API quota or cold start | Check GOOGLE_API_KEY quota; add `--workers 2` to CMD |
| `ImportError` on startup | requirements.txt outdated | `pip freeze > requirements.txt` locally and re-deploy |

---

## Architecture Note

The agent runs as a **stateless FastAPI server**. Each request:
1. Receives user message + session_id + history from Next.js `/api/rag/chat`
2. Queries Supabase vector store for relevant hospital/procedure data
3. Passes context + history to Gemini 1.5 Flash via LangGraph
4. Returns structured response with optional citations

The Next.js API route at `app/api/rag/chat/route.ts` acts as a proxy:
- If `PYTHON_AGENT_URL` is set → forwards to this Python agent
- If not set → falls back to direct OpenAI call (less capable)
