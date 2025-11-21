from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    password: str
    role: str  # "puller", "admin", "consumer"
    is_approved: bool = Field(default=False)
    points: int = Field(default=0)
    rating: float = Field(default=0.0)
    total_rides: int = Field(default=0)

class RideRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    destination: str
    status: str = Field(default="pending")  # pending, accepted, rejected, completed
    consumer_id: Optional[int] = Field(default=None)
    puller_id: Optional[int] = Field(default=None)
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    accepted_at: Optional[str] = None
    completed_at: Optional[str] = None
    rating: Optional[int] = None
    review: Optional[str] = None
    pickup_location: Optional[str] = None
    distance_km: Optional[float] = None

class Notification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    message: str
    is_read: bool = Field(default=False)
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    notification_type: str  # "ride_accepted", "ride_completed", "rating_received", etc.

class Analytics(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: str
    total_rides: int = Field(default=0)
    completed_rides: int = Field(default=0)
    rejected_rides: int = Field(default=0)
    active_pullers: int = Field(default=0)
    total_points_awarded: int = Field(default=0)
