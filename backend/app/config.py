import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
DOCUMENTS_DIR = STORAGE_DIR / "documents"
DATA_DIR = BASE_DIR / "app" / "data"

STORAGE_DIR.mkdir(parents=True, exist_ok=True)
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Project Metadata
PROJECT_NAME = "AICTE Application Validation Platform (Prototype)"
PRODUCT_PRINCIPLE = (
    "DECISION SUPPORT, NOT A DECISION MAKER: Every flag is advisory, carries evidence "
    "and a plain-language reason, and the final decision always stays with the AICTE scrutiny officer."
)

# API Server Settings
PORT = 8000
HOST = "0.0.0.0"

# Mock Issuer Service URL (Internal or external)
ISSUER_MOCK_BASE_URL = "http://127.0.0.1:8000/api/issuer"
