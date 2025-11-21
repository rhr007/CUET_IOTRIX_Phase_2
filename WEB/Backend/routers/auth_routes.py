from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from db import get_db
from models import User
from schemas import UserBase, LoginBase
from auth import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup")
def signup(userInfo: UserBase, db: Session = Depends(get_db)):
    existing = db.exec(select(User).where(User.phone == userInfo.phone)).first()
    if existing:
        raise HTTPException(400, "Phone already registered")

    
    userInfo.password = hash_password(userInfo.password)
    userInfo.ac_type = userInfo.ac_type.lower()
    new_user = User.model_validate(userInfo)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Signup complete, waiting for admin approval"}

@router.post("/login")
def login(userInfo: LoginBase, db: Session = Depends(get_db)):
    user = db.exec(select(User).where(User.phone == userInfo.phone)).first()

    if not user or not verify_password(userInfo.password, user.password):
        raise HTTPException(401, "Invalid credentials")

    if not user.is_active:
        raise HTTPException(403, "Account not approved by admin")

    return {"message": "Login successful", "ac_type": user.ac_type, "user_id": user.id, 'name': user.name}

