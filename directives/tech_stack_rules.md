# Directive: Tech Stack Rules

## Goal
Prevent "Tech Drift" by explicitly defining the allowed tools. Agents must NOT install alternatives.

## The Stack

| Category | Tool | Rule |
| :--- | :--- | :--- |
| **Framework** | Next.js 15+ (App Router) | No Pages Router. |
| **Language** | TypeScript | No raw JS. Strict mode. |
| **CSS** | TailwindCSS v4 | No Emotion, Styled-Components, or plain CSS modules (unless legacy). |
| **Components** | Radix UI / Shadcn | No Material UI, Chakra, or AntD. |
| **Icons** | Lucide React | No FontAwesome. |
| **Data Fetching** | TanStack React Query | No SWR or raw `useEffect` fetch. |
| **Forms** | React Hook Form + Zod | No Formik. |
| **Auth** | Supabase (Stub for now) | No NextAuth/Auth.js (unless explicit change request). |
| **I18n** | i18next / react-i18next | No next-intl (unless explicit change request). |
| **AI Orchestration** | **LangGraph** (Python) | No legacy LangChain Chains, No AutoGen (unless research). |
| **Automation** | **n8n** | Use for API blending and external tool calls. |
| **Backend (AI)** | Python 3.11+ | Use `venv`. Keep separate from Next.js runtime. |

## Enforcement
If an agent suggests installing a libraries that competes with the above (e.g., "Let's install Redux"), **REJECT IT**. Point to this directive.
