# Directive: Implement Voice Agent (Production Medical-Grade)

## Goal
Implement a low-latency, HIPAA-compliant voice agent for KmedTour using a Hybrid Architecture (Rule-based Fast Path + LLM Slow Path).

## Core Philosophy
> "Speed is feature #1. Compliance is feature #0."

## Strategic Alignment
- **Deep Tech**: Uses advanced audio pipeline (Daily.co, Deepgram, ElevenLabs).
- **Medical OS**: Integrated directly with `PatientJourneyStateMachine`.
- **Compliance**: Behavioral gates enforced *before* any PHI processing.

## Architecture

```mermaid
graph TD
    User((User)) <-->|WebRTC/SIP| Daily[Daily.co / Telnyx]
    Daily <-->|Stream| STT[Transcriber (Deepgram/Assembly)]
    STT -->|Text| Router{Intent Router}
    
    subgraph "Fast Path (<200ms)"
        Router -->|Simple Query| Templates[Template Audio]
        Router -->|Data Query| DB[Supabase Lookup]
    end
    
    subgraph "Intelligent Path (800ms+)"
        Router -->|Complex| LLM[Claude Haiku/Sonnet]
    end
    
    Templates --> Mixer
    DB --> Mixer
    LLM -->|Text| TTS[ElevenLabs stream]
    TTS --> Mixer
    
    Mixer -->|Audio| Daily
    
    subgraph "Compliance & State"
        Router -.->|Log| Compliance[Compliance Guard]
        Compliance -.->|Verify| State[PatientJourneyStateMachine]
    end
```

## Implementation Steps

### Phase 1: Infrastructure & "The Fast Path"
1.  **Setup Directory Structure**:
    - `agents/src/voice/core/` (Pipeline orchestration)
    - `agents/src/voice/compliance/` (HIPAA gates)
    - `agents/src/voice/routers/` (Fast-path logic)
2.  **Compliance Layer Implementation**:
    - Create `MedicalVoiceCompliance` class.
    - Implement `verify_identity` against Supabase.
    - **CRITICAL**: Integration with `agents/src/core/state_machine.py`.
3.  **Fast Path Router**:
    - Implement Regex/Keyword spotting for zero-latency routing.
    - Create `TemplateResponse` manager (pre-generated MP3s).

### Phase 2: The "Intelligent Path" & Streaming
4.  **STT/TTS Integration**:
    - Implement `DeepgramService` (Streaming).
    - Implement `ElevenLabsService` (Streaming).
5.  **LLM Integration**:
    - Connect `Claude Haiku` for intermediate reasoning (cheaper/faster than Sonnet).
    - Implement "Interruption Handling" (stop TTS if user speaks).

### Phase 3: State Machine Integration
6.  **State Transitions**:
    - Voice events must trigger state changes (e.g., `INQUIRY` -> `SCREENING`).
    - Use `PatientJourneyStateMachine.transition()`.
7.  **Audit Logging**:
    - Voice transcripts must be logged to `journey_events` (via State Machine).

## Technical Constraints (Strict)
- **Latency Budget**: Total Turn-Around Time (TAT) < 800ms for 80% of queries.
- **Protocol**: WebRTC (Browser) or SIP (Phone). No HTTP polling for audio.
- **Security**: No PHI in LLM prompt without de-identification (unless BAA signed with LLM provider).

## Verification Checklist after Implementation
- [ ] **Latency Test**: "Hello" -> Response is under 500ms?
- [ ] **Interruption Test**: Does bot stop speaking immediately when interrupted?
- [ ] **Compliance Test**: Does it refuse to give medical info without ID verification?
- [ ] **Datbase Test**: Do calls show up in `patient_journey_state` table?
