from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from models import RideRequest, User, Notification
from datetime import datetime
from db import get_session

router = APIRouter(prefix="/puller", tags=["Puller"])

def create_notification(session: Session, user_id: int, message: str, notification_type: str):
    notification = Notification(
        user_id=user_id,
        message=message,
        notification_type=notification_type
    )
    session.add(notification)

@router.get("/requests")
def get_ride_requests(session: Session = Depends(get_session)):
    requests = session.exec(
        select(RideRequest).where(RideRequest.status == "pending")
    ).all()
    
    return [
        {
            "id": r.id,
            "destination": r.destination,
            "created_at": r.created_at,
            "consumer_id": r.consumer_id,
            "pickup_location": r.pickup_location
        }
        for r in requests
    ]

@router.post("/accept")
def accept_ride(ride_id: int, puller_id: int, session: Session = Depends(get_session)):
    ride = session.get(RideRequest, ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    if ride.status != "pending":
        raise HTTPException(status_code=400, detail="Ride already processed")
    
    ride.status = "accepted"
    ride.puller_id = puller_id
    ride.accepted_at = datetime.now().isoformat()
    
    session.add(ride)
    
    # Create notification for consumer
    if ride.consumer_id:
        create_notification(
            session,
            ride.consumer_id,
            f"Your ride to {ride.destination} has been accepted!",
            "ride_accepted"
        )
    
    session.commit()
    
    return {"message": "Ride accepted", "ride_id": ride.id}

@router.post("/reject")
def reject_ride(ride_id: int, puller_id: int, session: Session = Depends(get_session)):
    ride = session.get(RideRequest, ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    if ride.status != "pending":
        raise HTTPException(status_code=400, detail="Ride already processed")
    
    ride.status = "rejected"
    ride.puller_id = puller_id
    
    session.add(ride)
    
    # Create notification for consumer
    if ride.consumer_id:
        create_notification(
            session,
            ride.consumer_id,
            f"Your ride to {ride.destination} was not available. Please try again.",
            "ride_rejected"
        )
    
    session.commit()
    
    return {"message": "Ride rejected", "ride_id": ride.id}

@router.get("/accepted")
def get_accepted_rides(puller_id: int, session: Session = Depends(get_session)):
    rides = session.exec(
        select(RideRequest).where(
            RideRequest.puller_id == puller_id,
            RideRequest.status == "accepted"
        )
    ).all()
    
    return [
        {
            "id": r.id,
            "destination": r.destination,
            "accepted_at": r.accepted_at,
            "consumer_id": r.consumer_id
        }
        for r in rides
    ]

@router.post("/complete")
def complete_ride(ride_id: int, puller_id: int, session: Session = Depends(get_session)):
    ride = session.get(RideRequest, ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    if ride.puller_id != puller_id:
        raise HTTPException(status_code=403, detail="Not your ride")
    
    if ride.status != "accepted":
        raise HTTPException(status_code=400, detail="Ride not in accepted state")
    
    ride.status = "completed"
    ride.completed_at = datetime.now().isoformat()
    
    # Award points to puller
    puller = session.get(User, puller_id)
    if puller:
        puller.points += 100
        puller.total_rides += 1
        session.add(puller)
    
    session.add(ride)
    
    # Create notification for consumer
    if ride.consumer_id:
        create_notification(
            session,
            ride.consumer_id,
            f"Your ride to {ride.destination} has been completed. Please rate your experience!",
            "ride_completed"
        )
    
    session.commit()
    
    return {"message": "Ride completed", "points_awarded": 100}

@router.get("/completed")
def get_completed_rides(puller_id: int, session: Session = Depends(get_session)):
    rides = session.exec(
        select(RideRequest).where(
            RideRequest.puller_id == puller_id,
            RideRequest.status == "completed"
        )
    ).all()
    
    return [
        {
            "id": r.id,
            "destination": r.destination,
            "completed_at": r.completed_at,
            "rating": r.rating,
            "review": r.review
        }
        for r in rides
    ]

@router.get("/history")
def get_ride_history(puller_id: int, session: Session = Depends(get_session)):
    rides = session.exec(
        select(RideRequest).where(RideRequest.puller_id == puller_id)
    ).all()
    
    return [
        {
            "id": r.id,
            "destination": r.destination,
            "status": r.status,
            "created_at": r.created_at,
            "completed_at": r.completed_at,
            "rating": r.rating
        }
        for r in rides
    ]
