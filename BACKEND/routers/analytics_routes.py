from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from models import RideRequest, User, Analytics
from datetime import datetime, timedelta
from db import get_session

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
def get_dashboard_stats(session: Session = Depends(get_session)):
    # Total rides
    total_rides = len(session.exec(select(RideRequest)).all())
    
    # Completed rides
    completed_rides = len(session.exec(
        select(RideRequest).where(RideRequest.status == "completed")
    ).all())
    
    # Pending rides
    pending_rides = len(session.exec(
        select(RideRequest).where(RideRequest.status == "pending")
    ).all())
    
    # Active pullers (approved)
    active_pullers = len(session.exec(
        select(User).where(User.role == "puller", User.is_approved == True)
    ).all())
    
    # Total points awarded
    all_pullers = session.exec(select(User).where(User.role == "puller")).all()
    total_points = sum(p.points for p in all_pullers)
    
    # Top rated pullers
    top_pullers = session.exec(
        select(User).where(User.role == "puller", User.rating > 0).order_by(User.rating.desc()).limit(5)
    ).all()
    
    return {
        "total_rides": total_rides,
        "completed_rides": completed_rides,
        "pending_rides": pending_rides,
        "active_pullers": active_pullers,
        "total_points_awarded": total_points,
        "completion_rate": round((completed_rides / total_rides * 100) if total_rides > 0 else 0, 2),
        "top_pullers": [
            {
                "id": p.id,
                "username": p.username,
                "rating": p.rating,
                "total_rides": p.total_rides,
                "points": p.points
            }
            for p in top_pullers
        ]
    }

@router.get("/rides-by-status")
def get_rides_by_status(session: Session = Depends(get_session)):
    statuses = ["pending", "accepted", "rejected", "completed"]
    result = {}
    
    for status in statuses:
        count = len(session.exec(
            select(RideRequest).where(RideRequest.status == status)
        ).all())
        result[status] = count
    
    return result

@router.get("/popular-destinations")
def get_popular_destinations(session: Session = Depends(get_session)):
    rides = session.exec(select(RideRequest)).all()
    
    destination_counts = {}
    for ride in rides:
        if ride.destination in destination_counts:
            destination_counts[ride.destination] += 1
        else:
            destination_counts[ride.destination] = 1
    
    # Sort by count
    sorted_destinations = sorted(destination_counts.items(), key=lambda x: x[1], reverse=True)
    
    return [
        {"destination": dest, "count": count}
        for dest, count in sorted_destinations[:10]
    ]

@router.get("/recent-activity")
def get_recent_activity(limit: int = 20, session: Session = Depends(get_session)):
    rides = session.exec(
        select(RideRequest).order_by(RideRequest.created_at.desc()).limit(limit)
    ).all()
    
    return [
        {
            "id": r.id,
            "destination": r.destination,
            "status": r.status,
            "created_at": r.created_at,
            "completed_at": r.completed_at
        }
        for r in rides
    ]
