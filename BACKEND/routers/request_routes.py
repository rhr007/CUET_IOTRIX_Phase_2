from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from models import RideRequest
from db import get_session

router = APIRouter(prefix="/request", tags=["Ride Requests"])

@router.get("/create")
def create_request(destination: str, consumer_id: int = None, pickup_location: str = None, session: Session = Depends(get_session)):
    new_request = RideRequest(
        destination=destination,
        consumer_id=consumer_id,
        pickup_location=pickup_location
    )
    session.add(new_request)
    session.commit()
    session.refresh(new_request)
    
    return {"request_id": new_request.id, "status": "pending", "destination": destination}

@router.get("/check")
def check_status(id: int, session: Session = Depends(get_session)):
    ride = session.get(RideRequest, id)
    if not ride:
        raise HTTPException(status_code=404, detail="Request not found")
    
    return ride.status

@router.get("/history")
def get_ride_history(consumer_id: int, session: Session = Depends(get_session)):
    rides = session.exec(
        select(RideRequest).where(RideRequest.consumer_id == consumer_id)
    ).all()
    
    return [
        {
            "id": r.id,
            "destination": r.destination,
            "status": r.status,
            "created_at": r.created_at,
            "completed_at": r.completed_at,
            "rating": r.rating,
            "puller_id": r.puller_id
        }
        for r in rides
    ]
