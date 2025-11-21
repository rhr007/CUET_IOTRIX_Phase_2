from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
import secrets
from datetime import datetime

from models import Token, User  # your Token and User models
from db import get_db  # your SQLModel session

router = APIRouter(prefix="/manager", tags=["Manager"])


# Manager creates a new token for a student
@router.post("/create-token/{id}/{token}", response_model=Token)
def create_token(id: int, token: str, session: Session = Depends(get_db)):
    
    existing_token = session.exec(select(Token).where(Token.token_value == token)).first()
    if existing_token:
        raise HTTPException(400, "token already available")

    else:

        token = Token(
            token_value=token,
            given_by=id,
            created_at=datetime.now()
        )

        session.add(token)
        session.commit()
        session.refresh(token)
        
        return token
    

@router.get('/used/token')
def get_used_token(db: Session = Depends(get_db)):
    tokens = db.exec(select(Token).where(Token.is_used == True)).all()

    return tokens

@router.get('/unused/token')
def get_used_token(db: Session = Depends(get_db)):
    tokens = db.exec(select(Token).where(Token.is_used == False)).all()

    return tokens
