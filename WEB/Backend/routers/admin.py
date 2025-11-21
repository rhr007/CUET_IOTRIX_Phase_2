from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_db
from models import User

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/pending")
def get_pending_users(db: Session = Depends(get_db)):
    users = db.exec(select(User).where(User.is_active == False)).all()
    return users

@router.post("/approve/{user_id}")
def approve_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    user.is_active = True
    db.add(user)
    db.commit()
    return {"message": "User approved"}

@router.post("/reject/{user_id}")
def reject_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    db.delete(user)
    db.commit()
    return {"message": "User rejected"}
