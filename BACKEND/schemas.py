from pydantic import BaseModel
from typing import Optional

class UserSignup(BaseModel):
    username: str
    password: str
    role: str

class UserLogin(BaseModel):
    username: str
    password: str

class RideRating(BaseModel):
    ride_id: int
    rating: int
    review: Optional[str] = None
