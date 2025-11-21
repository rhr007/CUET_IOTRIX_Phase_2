from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from models import User
from schemas import UserSignup, UserLogin
from auth import hash_password, verify_password
from db import get_session

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup")
def signup(user_data: UserSignup, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.username == user_data.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed = hash_password(user_data.password)
    
    # Auto-approve admins and consumers, pullers need approval
    is_approved = user_data.role in ["admin", "consumer"]
    
    new_user = User(
        username=user_data.username,
        password=hashed,
        role=user_data.role,
        is_approved=is_approved
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    return {
        "id": new_user.id,
        "username": new_user.username,
        "role": new_user.role,
        "is_approved": new_user.is_approved
    }

@router.post("/login")
def login(user_data: UserLogin, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == user_data.username)).first()
    
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_approved:
        raise HTTPException(status_code=403, detail="Account not approved yet")
    
    return {
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "points": user.points,
        "rating": user.rating
    }

@router.get("/me/{user_id}")
def get_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "points": user.points,
        "rating": user.rating,
        "total_rides": user.total_rides
    }
