from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from models import RideRequest, User, Notification
from schemas import RideRating
from db import get_session

router = APIRouter(prefix="/rating", tags=["Ratings"])

def create_notification(session: Session, user_id: int, message: str, notification_type: str):
    notification = Notification(
        user_id=user_id,
        message=message,
        notification_type=notification_type
    )
    session.add(notification)

@router.post("/submit")
def submit_rating(rating_data: RideRating, session: Session = Depends(get_session)):
    ride = session.get(RideRequest, rating_data.ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    if ride.status != "completed":
        raise HTTPException(status_code=400, detail="Can only rate completed rides")
    
    if rating_data.rating < 1 or rating_data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    ride.rating = rating_data.rating
    ride.review = rating_data.review
    session.add(ride)
    
    # Update puller's average rating
    if ride.puller_id:
        puller = session.get(User, ride.puller_id)
        if puller:
            rated_rides = session.exec(
                select(RideRequest).where(
                    RideRequest.puller_id == ride.puller_id,
                    RideRequest.rating.isnot(None)
                )
            ).all()
            
            if rated_rides:
                total_rating = sum(r.rating for r in rated_rides)
                puller.rating = round(total_rating / len(rated_rides), 2)
                session.add(puller)
                
                # Notify puller
                create_notification(
                    session,
                    ride.puller_id,
                    f"You received a {rating_data.rating}-star rating!",
                    "rating_received"
                )
    
    session.commit()
    
    return {"message": "Rating submitted successfully"}

@router.get("/puller/{puller_id}")
def get_puller_ratings(puller_id: int, session: Session = Depends(get_session)):
    rides = session.exec(
        select(RideRequest).where(
            RideRequest.puller_id == puller_id,
            RideRequest.rating.isnot(None)
        )
    ).all()
    
    return [
        {
            "ride_id": r.id,
            "rating": r.rating,
            "review": r.review,
            "destination": r.destination,
            "completed_at": r.completed_at
        }
        for r in rides
    ]
