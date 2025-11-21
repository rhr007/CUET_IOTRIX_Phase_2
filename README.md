# CUET IOTRIX Phase 2

**An Enhanced IoT-based Smart Ride Management System**

Phase 2 builds upon the foundation of Phase 1 with significant enhancements including real-time analytics, rating systems, notifications, and improved user experience.

---

## 🚀 What's New in Phase 2

### Backend Enhancements
- ✅ **Rating & Review System**: Consumers can rate pullers after ride completion
- ✅ **Real-time Notifications**: Push notifications for ride status updates
- ✅ **Analytics Dashboard**: Comprehensive statistics and insights
- ✅ **Ride History Tracking**: Complete history of all rides with detailed information
- ✅ **Enhanced Data Models**: Additional fields for better tracking (timestamps, ratings, locations)
- ✅ **Popular Destinations**: Track and display most requested destinations

### Frontend Enhancements
- ✅ **Analytics Visualization**: Interactive charts using Recharts library
- ✅ **Rating System UI**: Easy-to-use star rating interface
- ✅ **Notification Center**: Real-time notification display for all users
- ✅ **Enhanced Dashboards**: Improved UI for Admin, Puller, and Consumer roles
- ✅ **Ride History Views**: Detailed ride history with filtering capabilities
- ✅ **Responsive Design**: Beautiful, modern UI that works on all devices

### IoT Enhancements
- ✅ **Improved Error Handling**: Better resilience and error recovery
- ✅ **Enhanced Status Feedback**: More detailed LED and buzzer patterns
- ✅ **Real-time Updates**: Faster status checking and notification delivery
- ✅ **Better Code Structure**: More maintainable and documented code

---

## 📋 Features

### User Roles

#### Admin
- Approve/reject puller registrations
- View system-wide analytics and statistics
- Monitor all rides and users
- Access to comprehensive dashboard with charts and insights
- View top-rated pullers

#### Puller
- View pending ride requests in real-time
- Accept or reject ride requests
- Mark rides as completed and earn points
- View ride history and ratings
- Receive notifications for ratings and feedback
- Track personal performance metrics

#### Consumer
- Request rides via ESP32 device
- Track ride status in real-time
- Rate and review completed rides
- View ride history
- Receive notifications for ride status changes

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **SQLModel** - SQL database ORM with Pydantic integration
- **Argon2** - Secure password hashing
- **SQLite** - Lightweight database

### Frontend
- **React.js** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **SweetAlert2** - Beautiful alerts
- **Recharts** - Data visualization

### IoT
- **ESP32** - Microcontroller
- **MicroPython** - Python for microcontrollers
- **Ultrasonic Sensor** - Distance measurement
- **LDR** - Light detection
- **OLED Display** - Status display
- **LEDs & Buzzer** - Visual and audio feedback

---

## 📦 Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd BACKEND
```

2. **Create and activate virtual environment:**

Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

Linux/Mac:
```bash
python -m venv venv
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Run the server:**
```bash
uvicorn main:app --reload
```

The backend will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd FRONTEND
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run the development server:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### ESP32 Setup

1. **Install MicroPython** on your ESP32 devices

2. **Upload the appropriate code:**
   - `consumer_side_esp_code.py` for consumer devices
   - `puller_side_esp_code.py` for puller devices

3. **Configure WiFi credentials** in the code:
```python
sta_if.connect('YOUR_SSID', 'YOUR_PASSWORD')
```

4. **Update SERVER_IP** to match your backend server:
```python
SERVER_IP = 'YOUR_SERVER_IP'
```

5. **Wire the components** according to pin definitions in code

---

## 🔌 API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - User login
- `GET /auth/me/{user_id}` - Get user details

### Admin
- `GET /admin/pending` - Get pending puller approvals
- `POST /admin/approve/{user_id}` - Approve puller
- `POST /admin/reject/{user_id}` - Reject puller

### Puller
- `GET /puller/requests` - Get pending ride requests
- `POST /puller/accept` - Accept ride request
- `POST /puller/reject` - Reject ride request
- `GET /puller/accepted` - Get accepted rides
- `POST /puller/complete` - Complete ride
- `GET /puller/completed` - Get completed rides
- `GET /puller/history` - Get ride history

### Ride Requests
- `GET /request/create` - Create new ride request
- `GET /request/check` - Check ride status
- `GET /request/history` - Get consumer ride history

### Ratings
- `POST /rating/submit` - Submit ride rating
- `GET /rating/puller/{puller_id}` - Get puller ratings

### Analytics
- `GET /analytics/dashboard` - Get dashboard statistics
- `GET /analytics/rides-by-status` - Get rides grouped by status
- `GET /analytics/popular-destinations` - Get popular destinations
- `GET /analytics/recent-activity` - Get recent ride activity

### Notifications
- `GET /notifications/{user_id}` - Get user notifications
- `POST /notifications/mark-read/{notification_id}` - Mark as read
- `POST /notifications/mark-all-read/{user_id}` - Mark all as read
- `GET /notifications/unread-count/{user_id}` - Get unread count

---

## 🎯 How It Works

### Ride Request Flow

1. **Consumer Side:**
   - Consumer approaches the ESP32 device
   - Ultrasonic sensor detects presence (10-20 cm)
   - LDR verifies low light condition (security check)
   - Consumer presses destination button
   - Request is sent to backend
   - Status LEDs indicate request state
   - Consumer receives notification when ride is accepted

2. **Puller Side:**
   - Puller's ESP32 polls for pending requests
   - LED and buzzer alert on new request
   - OLED displays destination details
   - Puller accepts or rejects via buttons
   - Upon acceptance, ride becomes active
   - Puller completes ride via button press
   - Points are awarded automatically

3. **Backend Processing:**
   - Receives and stores ride request
   - Notifies relevant users
   - Tracks ride status changes
   - Updates puller points and ratings
   - Generates analytics data

4. **Frontend Updates:**
   - Real-time dashboard updates (every 2-5 seconds)
   - Notifications appear automatically
   - Charts and statistics update dynamically

### Rating System

1. Consumer completes a ride
2. Consumer dashboard shows "Rate This Ride" button
3. Consumer selects star rating (1-5) and optional review
4. Rating is saved to the ride record
5. Puller's average rating is recalculated
6. Puller receives notification about new rating

---

## 🔒 Security Features

- **Password Hashing**: Argon2 algorithm for secure password storage
- **Role-Based Access**: Different permissions for admin, puller, consumer
- **Approval System**: Pullers must be approved by admin
- **Input Validation**: All API inputs are validated
- **CORS Configuration**: Controlled cross-origin access

---

## 📊 Database Schema

### User Table
- id (Primary Key)
- username (Unique)
- password (Hashed)
- role (admin/puller/consumer)
- is_approved (Boolean)
- points (Integer)
- rating (Float)
- total_rides (Integer)

### RideRequest Table
- id (Primary Key)
- destination (String)
- status (pending/accepted/rejected/completed)
- consumer_id (Foreign Key)
- puller_id (Foreign Key)
- created_at (Timestamp)
- accepted_at (Timestamp)
- completed_at (Timestamp)
- rating (Integer)
- review (String)
- pickup_location (String)
- distance_km (Float)

### Notification Table
- id (Primary Key)
- user_id (Foreign Key)
- message (String)
- is_read (Boolean)
- created_at (Timestamp)
- notification_type (String)

### Analytics Table
- id (Primary Key)
- date (String)
- total_rides (Integer)
- completed_rides (Integer)
- rejected_rides (Integer)
- active_pullers (Integer)
- total_points_awarded (Integer)

---

## 🎨 UI Features

### Modern Design
- Gradient backgrounds
- Smooth animations and transitions
- Hover effects on cards
- Responsive layout for mobile and desktop
- Color-coded status indicators

### Interactive Charts
- Pie chart for rides by status
- Bar chart for popular destinations
- Real-time data updates
- Responsive chart sizing

### User Experience
- Intuitive navigation
- Clear visual feedback
- Real-time updates without page refresh
- Smooth transitions between states

---

## 🚦 LED Status Indicators

### Consumer Device
- **White LED**: Idle state
- **Yellow LED**: Request sent (pending)
- **Red LED**: Request rejected
- **Green LED**: Request accepted

### Puller Device
- **White LED**: Idle (no requests)
- **Yellow LED**: New request available
- **Green LED**: Ride in progress

---

## 🔧 Troubleshooting

### Backend Issues
- Ensure Python 3.10+ is installed
- Check if port 8000 is available
- Verify database file permissions

### Frontend Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check if backend is running
- Verify API_BASE_URL in `src/utils/api.js`

### ESP32 Issues
- Check WiFi credentials
- Verify server IP address
- Ensure all sensors are properly connected
- Check serial monitor for error messages
- Verify MicroPython installation

---

## 📈 Future Enhancements

- GPS integration for real-time location tracking
- Mobile app for iOS and Android
- Payment integration
- Advanced route optimization
- Multi-language support
- SMS notifications
- Emergency alert system
- Driver verification with photos

---

## 👥 User Guide

### For Admins
1. Login with admin credentials
2. Approve pending pullers from dashboard
3. View analytics by clicking "Analytics" button
4. Monitor system health and performance

### For Pullers
1. Register and wait for admin approval
2. Login after approval
3. Keep device/app open to receive requests
4. Accept requests quickly to earn more points
5. Complete rides to receive 100 points each
6. Maintain high ratings for better reputation

### For Consumers
1. Register as consumer (auto-approved)
2. Use ESP32 device to request rides
3. Track ride status in web dashboard
4. Rate completed rides to help the community

---

## 📝 License

This project is created for the CUET IOTRIX competition Phase 2.

---

## 🤝 Contributing

This is a competition project. For questions or issues, please contact the development team.

---

## 📧 Support

For technical support or questions, please refer to the documentation or contact the system administrator.

---

**Built with ❤️ for CUET IOTRIX Phase 2**