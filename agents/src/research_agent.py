import os
from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

from pathlib import Path
 # Load env variables from ../.env.local
env_path = Path(__file__).parent.parent.parent / '.env.local'
load_dotenv(dotenv_path=env_path)

# Initialize Gemini
llm = ChatGoogleGenerativeAI(
    model="models/gemini-1.5-flash",
    verbose=True,
    temperature=0.5,
    google_api_key=os.getenv("GOOGLE_GENERATIVE_AI_API_KEY") or os.getenv("GEMINI_API_KEY")
)

# Define the Agent
clinic_researcher = Agent(
  role='Senior Medical Tourism Researcher',
  goal='Discover and verify high-quality clinics in Korea for specific procedures',
  backstory="""You are an expert in Korean medical tourism. 
  Your job is to find accurate, up-to-date information about clinics, 
  verifying their accreditations (KAHF, JCI) and specialties.
  You refuse to recommend unverified clinics.""",
  verbose=True,
  allow_delegation=False,
  llm=llm
)

# Define the Task
def create_research_task(procedure: str):
    return Task(
      description=f"""
        1. Search for top-rated clinics in Seoul for {procedure}.
        2. Identify at least 3 clinics.
        3. For each clinic, list:
           - Name
           - Key Specialties
           - Accreditation Status
           - Estimated Price Range for {procedure}
      """,
      expected_output="A structured JSON-like list of 3 verfied clinics with details.",
      agent=clinic_researcher
    )

# Execution Function
def run_research(procedure: str):
    task = create_research_task(procedure)
    crew = Crew(
      agents=[clinic_researcher],
      tasks=[task],
      verbose=True,
      process=Process.sequential
    )
    result = crew.kickoff()
    return result

if __name__ == "__main__":
    print("## Starting Clinic Research Agent ##")
    result = run_research("Rhinoplasty")
    print("## Research Result ##")
    print(result)
