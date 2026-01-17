import sys
import os

# Add the project root to the python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from agents.src.workflows.patient_intake_graph import app

def test_workflow():
    print("Starting Patient Intake Workflow Test...")
    
    # Simulate initial state
    initial_state = {
        "patient_id": "p_123",
        "documents": ["medical_report.pdf", "lab_results.jpg"],
        "messages": []
    }
    
    # Run the graph
    config = {"configurable": {"thread_id": "thread_1"}}
    final_state = app.invoke(initial_state, config=config)
    
    # Print results
    print("\nWorkflow Completed Successfully!")
    print("-" * 30)
    print(f"Extracted Diagnosis: {final_state['extracted_data']['primary_diagnosis']}")
    print(f"Triage Level: {final_state['triage_result']['level']}")
    print(f"Matched Hospitals: {len(final_state['matched_hospitals'])}")
    print(f"Final Quote: {final_state['final_quote']['total_amount']} {final_state['final_quote']['currency']}")
    print(f"PDF URL: {final_state['final_quote']['pdf_url']}")
    print("-" * 30)

if __name__ == "__main__":
    test_workflow()
