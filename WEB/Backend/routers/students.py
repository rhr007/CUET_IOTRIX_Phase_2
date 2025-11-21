from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from models import Token
from db import get_db
from datetime import datetime

router = APIRouter(prefix="/student", tags=["Students"])

@router.post("/use/{student_id}/{token}", response_model=Token)
def use_token(student_id: int, token: str, session: Session = Depends(get_db)):
    # Check if token exists
    existing_token = session.exec(select(Token).where(Token.token_value == token)).first()
    if not existing_token:
        raise HTTPException(status_code=400, detail="No token available")
    
    # Check if token is already used
    if existing_token.is_used:
        raise HTTPException(status_code=400, detail="Token is already used")
    
    # Update token as used
    existing_token.is_used = True
    existing_token.used_at = datetime.now()
    existing_token.owned_by = student_id  # mark student as owner who used it
    
    session.add(existing_token)
    session.commit()
    session.refresh(existing_token)
    
    return existing_token


@router.get('/used/{id}')
def used_by_id(id: int, db:Session = Depends(get_db)):
    tokens = db.exec(select(Token).where(Token.owned_by == id)).all()
    return tokens
