# CUET IOTRIX Phase 2 - API Documentation

## Base URL
```
http://127.0.0.1:8000
```

## Authentication Endpoints

### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "role": "puller" | "consumer" | "admin"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "role": "puller",
  "is_approved": false
}
```

**Note:** Pullers require admin approval. Consumers and admins are auto-approved.

---

### POST /auth/login
User login.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "role": "puller",
  "points": 500,
  "rating": 4.5
}
```

**Error Response (401):**
```json
{
  "detail": "Invalid credentials"
}
```

**Error Response (403):**
```json
{
  "detail": "Account not approved yet"
}
```

---

### GET /auth/me/{user_id}
Get user details.

**Parameters:**
- `user_id` (path): User ID

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "role": "puller",
  "points": 500,
  "rating": 4.5,
  "total_rides": 25
}
```

---

## Admin Endpoints

### GET /admin/pending
Get list of pending puller approvals.

**Response:**
```json
[
  {
    "id": 2,
    "username": "new_puller",
    "role": "puller"
  }
]
```

---

### POST /admin/approve/{user_id}
Approve a pending puller.

**Parameters:**
- `user_id` (path): User ID to approve

**Response:**
```json
{
  "message": "Puller approved",
  "username": "new_puller"
}
```

---

### POST /admin/reject/{user_id}
Reject a pending puller (deletes the account).

**Parameters:**
- `user_id` (path): User ID to reject

**Response:**
```json
{
  "message": "Puller rejected and removed"
}
```

---

## Puller Endpoints

### GET /puller/requests
Get all pending ride requests.

**Response:**
```json
[
  {
    "id": 1,
    "destination": "PAHARTALI",
    "created_at": "2025-11-21T10:30:00",
    "consumer_id": 5,
    "pickup_location": "ESP_Device"
  }
]
```

---

### POST /puller/accept
Accept a ride request.

**Query Parameters:**
- `ride_id` (integer): Ride request ID
- `puller_id` (integer): Puller's user ID

**Response:**
```json
{
  "message": "Ride accepted",
  "ride_id": 1
}
```

---

### POST /puller/reject
Reject a ride request.

**Query Parameters:**
- `ride_id` (integer): Ride request ID
- `puller_id` (integer): Puller's user ID

**Response:**
```json
{
  "message": "Ride rejected",
  "ride_id": 1
}
```

---

### GET /puller/accepted
Get puller's accepted rides.

**Query Parameters:**
- `puller_id` (integer): Puller's user ID

**Response:**
```json
[
  {
    "id": 1,
    "destination": "PAHARTALI",
    "accepted_at": "2025-11-21T10:35:00",
    "consumer_id": 5
  }
]
```

---

### POST /puller/complete
Mark a ride as completed.

**Query Parameters:**
- `ride_id` (integer): Ride request ID
- `puller_id` (integer): Puller's user ID

**Response:**
```json
{
  "message": "Ride completed",
  "points_awarded": 100
}
```

---

### GET /puller/completed
Get puller's completed rides.

**Query Parameters:**
- `puller_id` (integer): Puller's user ID

**Response:**
```json
[
  {
    "id": 1,
    "destination": "PAHARTALI",
    "completed_at": "2025-11-21T10:45:00",
    "rating": 5,
    "review": "Great ride!"
  }
]
```

---

### GET /puller/history
Get complete ride history for a puller.

**Query Parameters:**
- `puller_id` (integer): Puller's user ID

**Response:**
```json
[
  {
    "id": 1,
    "destination": "PAHARTALI",
    "status": "completed",
    "created_at": "2025-11-21T10:30:00",
    "completed_at": "2025-11-21T10:45:00",
    "rating": 5
  }
]
```

---

## Ride Request Endpoints

### GET /request/create
Create a new ride request (used by ESP32 devices).

**Query Parameters:**
- `destination` (string): Destination name
- `consumer_id` (integer, optional): Consumer's user ID
- `pickup_location` (string, optional): Pickup location

**Response:**
```json
{
  "request_id": 1,
  "status": "pending",
  "destination": "PAHARTALI"
}
```

---

### GET /request/check
Check the status of a ride request.

**Query Parameters:**
- `id` (integer): Ride request ID

**Response:**
```json
"pending" | "accepted" | "rejected" | "completed"
```

---

### GET /request/history
Get ride history for a consumer.

**Query Parameters:**
- `consumer_id` (integer): Consumer's user ID

**Response:**
```json
[
  {
    "id": 1,
    "destination": "PAHARTALI",
    "status": "completed",
    "created_at": "2025-11-21T10:30:00",
    "completed_at": "2025-11-21T10:45:00",
    "rating": 5,
    "puller_id": 2
  }
]
```

---

## Rating Endpoints

### POST /rating/submit
Submit a rating for a completed ride.

**Request Body:**
```json
{
  "ride_id": 1,
  "rating": 5,
  "review": "Excellent service!"
}
```

**Response:**
```json
{
  "message": "Rating submitted successfully"
}
```

**Validation:**
- Rating must be between 1 and 5
- Can only rate completed rides

---

### GET /rating/puller/{puller_id}
Get all ratings for a specific puller.

**Parameters:**
- `puller_id` (path): Puller's user ID

**Response:**
```json
[
  {
    "ride_id": 1,
    "rating": 5,
    "review": "Excellent service!",
    "destination": "PAHARTALI",
    "completed_at": "2025-11-21T10:45:00"
  }
]
```

---

## Analytics Endpoints

### GET /analytics/dashboard
Get comprehensive dashboard statistics.

**Response:**
```json
{
  "total_rides": 150,
  "completed_rides": 120,
  "pending_rides": 10,
  "active_pullers": 25,
  "total_points_awarded": 12000,
  "completion_rate": 80.0,
  "top_pullers": [
    {
      "id": 2,
      "username": "best_puller",
      "rating": 4.9,
      "total_rides": 50,
      "points": 5000
    }
  ]
}
```

---

### GET /analytics/rides-by-status
Get ride counts grouped by status.

**Response:**
```json
{
  "pending": 10,
  "accepted": 5,
  "rejected": 15,
  "completed": 120
}
```

---

### GET /analytics/popular-destinations
Get most popular destinations.

**Response:**
```json
[
  {
    "destination": "PAHARTALI",
    "count": 50
  },
  {
    "destination": "NOAPARA",
    "count": 45
  },
  {
    "destination": "RAOJAN",
    "count": 40
  }
]
```

---

### GET /analytics/recent-activity
Get recent ride activity.

**Query Parameters:**
- `limit` (integer, optional): Number of results (default: 20)

**Response:**
```json
[
  {
    "id": 150,
    "destination": "PAHARTALI",
    "status": "completed",
    "created_at": "2025-11-21T10:30:00",
    "completed_at": "2025-11-21T10:45:00"
  }
]
```

---

## Notification Endpoints

### GET /notifications/{user_id}
Get all notifications for a user.

**Parameters:**
- `user_id` (path): User ID

**Response:**
```json
[
  {
    "id": 1,
    "message": "Your ride to PAHARTALI has been accepted!",
    "is_read": false,
    "created_at": "2025-11-21T10:35:00",
    "notification_type": "ride_accepted"
  }
]
```

---

### POST /notifications/mark-read/{notification_id}
Mark a notification as read.

**Parameters:**
- `notification_id` (path): Notification ID

**Response:**
```json
{
  "message": "Notification marked as read"
}
```

---

### POST /notifications/mark-all-read/{user_id}
Mark all notifications as read for a user.

**Parameters:**
- `user_id` (path): User ID

**Response:**
```json
{
  "message": "Marked 5 notifications as read"
}
```

---

### GET /notifications/unread-count/{user_id}
Get count of unread notifications.

**Parameters:**
- `user_id` (path): User ID

**Response:**
```json
{
  "unread_count": 3
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Error message describing what went wrong"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Account not approved yet"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

Currently, there are no rate limits implemented. For production use, consider implementing rate limiting to prevent abuse.

---

## CORS Configuration

The API allows all origins (`*`) for development. For production, configure specific allowed origins in `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Testing the API

### Using cURL

**Test signup:**
```bash
curl -X POST http://127.0.0.1:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","role":"consumer"}'
```

**Test login:**
```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### Using the Interactive API Docs

Visit `http://127.0.0.1:8000/docs` for automatic interactive API documentation powered by FastAPI's Swagger UI.

---

## Database Models

### User Model
- `id`: Integer (Primary Key)
- `username`: String (Unique)
- `password`: String (Hashed)
- `role`: String (admin/puller/consumer)
- `is_approved`: Boolean
- `points`: Integer
- `rating`: Float
- `total_rides`: Integer

### RideRequest Model
- `id`: Integer (Primary Key)
- `destination`: String
- `status`: String (pending/accepted/rejected/completed)
- `consumer_id`: Integer (Optional)
- `puller_id`: Integer (Optional)
- `created_at`: String (ISO timestamp)
- `accepted_at`: String (Optional, ISO timestamp)
- `completed_at`: String (Optional, ISO timestamp)
- `rating`: Integer (Optional, 1-5)
- `review`: String (Optional)
- `pickup_location`: String (Optional)
- `distance_km`: Float (Optional)

### Notification Model
- `id`: Integer (Primary Key)
- `user_id`: Integer
- `message`: String
- `is_read`: Boolean
- `created_at`: String (ISO timestamp)
- `notification_type`: String

### Analytics Model
- `id`: Integer (Primary Key)
- `date`: String
- `total_rides`: Integer
- `completed_rides`: Integer
- `rejected_rides`: Integer
- `active_pullers`: Integer
- `total_points_awarded`: Integer

---

## Points System

- **Ride Completion**: 100 points per completed ride
- Points are automatically awarded when a puller marks a ride as completed
- Points are tracked in the `User` model

---

## Rating System

- Consumers can rate completed rides from 1-5 stars
- Optional text review can be added
- Puller's overall rating is calculated as the average of all their ride ratings
- Rating updates automatically trigger a notification to the puller

---

## Notification Types

- `ride_accepted`: Ride request was accepted by a puller
- `ride_rejected`: Ride request was rejected
- `ride_completed`: Ride was marked as completed
- `rating_received`: Puller received a new rating

---

## Best Practices

1. **Always handle errors gracefully** in your client application
2. **Poll endpoints responsibly** - Use reasonable intervals (3-5 seconds)
3. **Validate user input** before making API calls
4. **Store user credentials securely** - Never log passwords
5. **Use HTTPS in production** for secure communication
6. **Implement proper authentication** for production use (JWT tokens recommended)

---

**API Version**: 2.0  
**Last Updated**: November 2025
