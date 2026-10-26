#!/usr/bin/env bash
set -e

echo "========================================================================="
echo "  AICTE Application Validation Platform (Prototype)"
echo "========================================================================="
echo ""
echo "Product Principle: DECISION SUPPORT, NOT A DECISION MAKER."
echo ""

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[1/3] Generating Synthetic Applications & Documents..."
cd "$ROOT_DIR/backend"
python3 -m app.data.dataset_generator

echo ""
echo "[2/3] Starting FastAPI Backend on port 8000..."
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

echo ""
echo "[3/3] Starting React Frontend on port 5173..."
cd "$ROOT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Platform services running!"
echo "- Frontend: http://localhost:5173"
echo "- Backend:  http://localhost:8000"
echo "- API Docs: http://localhost:8000/docs"
echo ""
echo "Press CTRL+C to terminate all services."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM
wait
