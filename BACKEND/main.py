from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import init_db
from routers import auth_routes, admin_routes, puller_routes, request_routes, rating_routes, analytics_routes, notification_routes

app = FastAPI(title="CUET IOTRIX Phase 2", version="2.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
def on_startup():
    init_db()

# Include routers
app.include_router(auth_routes.router)
app.include_router(admin_routes.router)
app.include_router(puller_routes.router)
app.include_router(request_routes.router)
app.include_router(rating_routes.router)
app.include_router(analytics_routes.router)
app.include_router(notification_routes.router)

@app.get("/")
def root():
    return {
        "message": "CUET IOTRIX Phase 2 API",
        "version": "2.0",
        "features": [
            "User authentication and authorization",
            "Ride request management",
            "Real-time ride tracking",
            "Rating and review system",
            "Analytics dashboard",
            "Notification system",
            "Admin controls"
        ]
    }
