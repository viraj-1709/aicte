import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import (
    PROJECT_NAME,
    PRODUCT_PRINCIPLE,
    DOCUMENTS_DIR
)
from .api import applications, documents, admin, tamper_demo, evaluation
from .issuer_mock.mock_service import mock_issuer_service

app = FastAPI(
    title=PROJECT_NAME,
    description=(
        f"Official Regulatory Validation Platform (Prototype). {PRODUCT_PRINCIPLE}"
    ),
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded documents statically
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static/documents", StaticFiles(directory=str(DOCUMENTS_DIR)), name="documents")

# Include Core API Routers
app.include_router(applications.router)
app.include_router(documents.router)
app.include_router(admin.router)
app.include_router(tamper_demo.router)

# Evaluation Benchmark Endpoint
@app.get("/api/evaluation/benchmark", tags=["Evaluation"])
def get_evaluation_metrics():
    return evaluation.run_evaluation_benchmark()

# Standalone Mock Issuing Authorities API Endpoints
@app.get("/api/issuer/society/{reg_no}", tags=["Mock Issuing Authorities"])
def verify_society_endpoint(reg_no: str, name: str = ""):
    return mock_issuer_service.verify_society(reg_no, name)

@app.get("/api/issuer/land/{survey_no}", tags=["Mock Issuing Authorities"])
def verify_land_endpoint(survey_no: str, district: str = "", state: str = "", area: float = 5.0):
    return mock_issuer_service.verify_land_record(survey_no, district, state, area)

@app.get("/api/issuer/fire/{noc_no}", tags=["Mock Issuing Authorities"])
def verify_fire_endpoint(noc_no: str, inst_name: str = "", expiry: str = ""):
    return mock_issuer_service.verify_fire_noc(noc_no, inst_name, expiry)

@app.post("/api/issuer/toggle-outage", tags=["Mock Issuing Authorities"])
def toggle_issuer_outage(service_name: str = None):
    mock_issuer_service.set_simulated_outage(service_name)
    return {"simulated_outage_service": service_name}

@app.get("/", tags=["Root"])
def root():
    return {
        "project": PROJECT_NAME,
        "product_principle": PRODUCT_PRINCIPLE,
        "status": "RUNNING",
        "documentation": "/docs"
    }
