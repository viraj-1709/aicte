import json
from pathlib import Path
from typing import Dict, Any, Tuple
from ..config import DATA_DIR
from ..models.schemas import ApplicationDetail

def load_checklists() -> Dict[str, Any]:
    checklist_path = DATA_DIR / "checklists.json"
    if checklist_path.exists():
        with open(checklist_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def execute_step1_intake(application: Dict[str, Any]) -> Dict[str, Any]:
    """
    Step 1: Intake
    - Detect application category (New Institution, Extension of Approval, Closure/Variation)
    - Load matching configurable checklist (JSON/YAML)
    - Assign checklist requirements to dossier
    """
    checklists = load_checklists()
    category = application.get("category", "NEW_INSTITUTION")
    
    # Fallback / normalization
    if category not in checklists:
        category = "NEW_INSTITUTION"
        
    checklist_data = checklists[category]
    category_name = checklist_data.get("category_name", category)
    mandatory_docs = checklist_data.get("mandatory_documents", [])
    
    return {
        "step": 1,
        "step_name": "Intake & Category Detection",
        "category_code": category,
        "category_name": category_name,
        "mandatory_documents_count": len(mandatory_docs),
        "required_documents": [doc["doc_type"] for doc in mandatory_docs],
        "academic_session": checklist_data.get("academic_session", "2026-2027"),
        "status": "COMPLETED",
        "intake_timestamp": application.get("created_at")
    }
