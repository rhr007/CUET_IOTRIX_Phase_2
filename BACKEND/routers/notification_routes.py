from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from models import Notification
from db import get_session

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/{user_id}")
def get_notifications(user_id: int, session: Session = Depends(get_session)):
    notifications = session.exec(
        select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc())
    ).all()
    
    return [
        {
            "id": n.id,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at,
            "notification_type": n.notification_type
        }
        for n in notifications
    ]

@router.post("/mark-read/{notification_id}")
def mark_as_read(notification_id: int, session: Session = Depends(get_session)):
    notification = session.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    session.add(notification)
    session.commit()
    
    return {"message": "Notification marked as read"}

@router.post("/mark-all-read/{user_id}")
def mark_all_as_read(user_id: int, session: Session = Depends(get_session)):
    notifications = session.exec(
        select(Notification).where(Notification.user_id == user_id, Notification.is_read == False)
    ).all()
    
    for notification in notifications:
        notification.is_read = True
        session.add(notification)
    
    session.commit()
    
    return {"message": f"Marked {len(notifications)} notifications as read"}

@router.get("/unread-count/{user_id}")
def get_unread_count(user_id: int, session: Session = Depends(get_session)):
    count = len(session.exec(
        select(Notification).where(Notification.user_id == user_id, Notification.is_read == False)
    ).all())
    
    return {"unread_count": count}
