import uvicorn
from app.config import HOST, PORT

if __name__ == "__main__":
    print(f"Starting AICTE Validation Platform Backend on http://127.0.0.1:{PORT}")
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
