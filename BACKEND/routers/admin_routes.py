from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from models import User
from db import get_session

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/pending")
def get_pending_pullers(session: Session = Depends(get_session)):
    pullers = session.exec(
        select(User).where(User.role == "puller", User.is_approved == False)
    ).all()
    
    return [{"id": p.id, "username": p.username, "role": p.role} for p in pullers]

@router.post("/approve/{user_id}")
def approve_puller(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.role != "puller":
        raise HTTPException(status_code=400, detail="Only pullers need approval")
    
    user.is_approved = True
    session.add(user)
    session.commit()
    
    return {"message": "Puller approved", "username": user.username}

@router.post("/reject/{user_id}")
def reject_puller(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    session.delete(user)
    session.commit()
    
    return {"message": "Puller rejected and removed"}
