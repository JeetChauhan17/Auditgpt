from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="AuditGPT", version="2.0")

# --- CORS ---
# In production, VITE_FRONTEND_URL is set in Railway env vars
# e.g. https://your-app.vercel.app
# For local dev, localhost:5173 is allowed by default
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}
@app.get("/debug/routes-file")
def debug_routes_file():
    routes_path = os.path.join(os.path.dirname(__file__), "api", "routes.py")
    try:
        with open(routes_path) as f:
            lines = f.readlines()
        return {
            "total_lines": len(lines),
            "last_20_lines": "".join(lines[-20:]),
            "around_500": "".join(lines[488:510]) if len(lines) > 490 else "file shorter than 490 lines",
        }
    except Exception as e:
        return {"error": str(e)}

try:
    from backend.api.routes import router
    # app.include_router(router)
    app.include_router(router, prefix="/api")
except Exception as e:
    print(f"[ERROR] Failed to load API routes: {e}")

@app.get("/debug/python")
def debug_python():
    import sys
    return {"version": sys.version, "path": sys.executable}

    @app.get("/api/error")
    def route_error():
        return {"error": str(e)}
