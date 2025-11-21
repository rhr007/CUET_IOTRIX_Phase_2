# CUET IOTRIX Phase 2 - Testing Guide

This guide provides comprehensive testing procedures for all components of the system.

---

## Table of Contents
1. [Backend API Testing](#backend-api-testing)
2. [Frontend Testing](#frontend-testing)
3. [ESP32 Testing](#esp32-testing)
4. [Integration Testing](#integration-testing)
5. [Load Testing](#load-testing)

---

## Backend API Testing

### Setup Test Environment
```bash
cd BACKEND
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Test Suite 1: Authentication

#### Test 1.1: User Signup (Admin)
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test_admin","password":"admin123","role":"admin"}'
```
**Expected**: 200 OK, user created with `is_approved: true`

#### Test 1.2: User Signup (Puller)
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test_puller","password":"puller123","role":"puller"}'
```
**Expected**: 200 OK, user created with `is_approved: false`

#### Test 1.3: User Signup (Consumer)
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test_consumer","password":"consumer123","role":"consumer"}'
```
**Expected**: 200 OK, user created with `is_approved: true`

#### Test 1.4: Login Success
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test_admin","password":"admin123"}'
```
**Expected**: 200 OK, returns user data with token

#### Test 1.5: Login Failure (Wrong Password)
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test_admin","password":"wrongpassword"}'
```
**Expected**: 401 Unauthorized

#### Test 1.6: Login Failure (Unapproved Puller)
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test_puller","password":"puller123"}'
```
**Expected**: 403 Forbidden, "Account not approved yet"

### Test Suite 2: Admin Operations

#### Test 2.1: Get Pending Pullers
```bash
curl http://localhost:8000/admin/pending
```
**Expected**: Array of pending pullers including test_puller

#### Test 2.2: Approve Puller
```bash
# Get puller ID from Test 2.1, then:
curl -X POST http://localhost:8000/admin/approve/2
```
**Expected**: 200 OK, puller approved

#### Test 2.3: Reject Puller
```bash
# Create another test puller first, then:
curl -X POST http://localhost:8000/admin/reject/3
```
**Expected**: 200 OK, puller removed

### Test Suite 3: Ride Request Management

#### Test 3.1: Create Ride Request
```bash
curl "http://localhost:8000/request/create?destination=PAHARTALI&consumer_id=3&pickup_location=TestLocation"
```
**Expected**: 200 OK, returns request_id

#### Test 3.2: Check Ride Status
```bash
# Use request_id from Test 3.1
curl "http://localhost:8000/request/check?id=1"
```
**Expected**: "pending"

#### Test 3.3: Get Pending Requests (Puller)
```bash
curl http://localhost:8000/puller/requests
```
**Expected**: Array containing the pending request

#### Test 3.4: Accept Ride Request
```bash
curl -X POST "http://localhost:8000/puller/accept?ride_id=1&puller_id=2"
```
**Expected**: 200 OK, ride accepted

#### Test 3.5: Verify Status Changed
```bash
curl "http://localhost:8000/request/check?id=1"
```
**Expected**: "accepted"

#### Test 3.6: Complete Ride
```bash
curl -X POST "http://localhost:8000/puller/complete?ride_id=1&puller_id=2"
```
**Expected**: 200 OK, 100 points awarded

### Test Suite 4: Rating System

#### Test 4.1: Submit Rating
```bash
curl -X POST http://localhost:8000/rating/submit \
  -H "Content-Type: application/json" \
  -d '{"ride_id":1,"rating":5,"review":"Excellent service!"}'
```
**Expected**: 200 OK

#### Test 4.2: Get Puller Ratings
```bash
curl http://localhost:8000/rating/puller/2
```
**Expected**: Array with rating data

#### Test 4.3: Invalid Rating (Out of Range)
```bash
curl -X POST http://localhost:8000/rating/submit \
  -H "Content-Type: application/json" \
  -d '{"ride_id":1,"rating":6,"review":"Test"}'
```
**Expected**: 400 Bad Request

### Test Suite 5: Analytics

#### Test 5.1: Dashboard Statistics
```bash
curl http://localhost:8000/analytics/dashboard
```
**Expected**: Statistics object with counts and top pullers

#### Test 5.2: Rides By Status
```bash
curl http://localhost:8000/analytics/rides-by-status
```
**Expected**: Object with counts for each status

#### Test 5.3: Popular Destinations
```bash
curl http://localhost:8000/analytics/popular-destinations
```
**Expected**: Array of destinations sorted by popularity

#### Test 5.4: Recent Activity
```bash
curl "http://localhost:8000/analytics/recent-activity?limit=5"
```
**Expected**: Array of 5 most recent rides

### Test Suite 6: Notifications

#### Test 6.1: Get User Notifications
```bash
curl http://localhost:8000/notifications/3
```
**Expected**: Array of notifications for consumer

#### Test 6.2: Unread Count
```bash
curl http://localhost:8000/notifications/unread-count/3
```
**Expected**: Count of unread notifications

#### Test 6.3: Mark as Read
```bash
curl -X POST http://localhost:8000/notifications/mark-read/1
```
**Expected**: 200 OK

#### Test 6.4: Mark All as Read
```bash
curl -X POST http://localhost:8000/notifications/mark-all-read/3
```
**Expected**: 200 OK, count of marked notifications

---

## Frontend Testing

### Setup
```bash
cd FRONTEND
npm install
npm run dev
```

### Manual Testing Checklist

#### Authentication Flow
- [ ] Navigate to login page
- [ ] Login with invalid credentials → See error message
- [ ] Login with valid credentials → Redirect to appropriate dashboard
- [ ] Logout → Redirect to login page
- [ ] Navigate to signup page
- [ ] Create new user → See success message
- [ ] Create duplicate user → See error message

#### Admin Dashboard
- [ ] View pending pullers list
- [ ] Approve puller → See success notification
- [ ] Reject puller → See confirmation
- [ ] View dashboard statistics
- [ ] Statistics update every 5 seconds
- [ ] Navigate to Analytics page
- [ ] View charts (pie and bar)
- [ ] Top pullers displayed correctly
- [ ] Logout functionality works

#### Puller Dashboard
- [ ] View pending requests tab
- [ ] Accept request → Request moves to accepted tab
- [ ] Reject request → Request removed
- [ ] View accepted rides tab
- [ ] Complete ride → Ride moves to completed tab
- [ ] View completed rides with ratings
- [ ] Points update correctly
- [ ] Notification badge shows unread count
- [ ] Real-time updates work (3 second interval)
- [ ] Logout functionality works

#### Consumer Dashboard
- [ ] View ride history
- [ ] See ride status indicators (colors)
- [ ] Rate completed ride
- [ ] Submit rating with review
- [ ] View notifications
- [ ] Notification badge updates
- [ ] Status updates in real-time
- [ ] Logout functionality works

#### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] All buttons accessible on mobile
- [ ] Charts resize properly
- [ ] Navigation works on all sizes

---

## ESP32 Testing

### Consumer Device Testing

#### Hardware Test
1. **Power Test**
   - [ ] Device powers on
   - [ ] LEDs light up during boot
   - [ ] OLED displays boot message

2. **Sensor Test**
   ```python
   # Test ultrasonic sensor
   distance = get_distance()
   print(f"Distance: {distance} cm")
   # Expected: Reading between 2-400 cm
   
   # Test LDR
   ldr_value = ldr.read()
   print(f"LDR Value: {ldr_value}")
   # Expected: 0-4095 range
   ```

3. **LED Test**
   ```python
   # Test each LED
   led_idle.value(1)
   sleep(1)
   led_idle.value(0)
   # Repeat for all LEDs
   ```

4. **Button Test**
   ```python
   # Press each button and verify interrupt triggers
   ```

#### WiFi Connection Test
```python
# Check serial output
# Expected: "WiFi connected: <IP address>"
```

#### API Communication Test
1. **Create Request Test**
   - [ ] Place hand in front of sensor (10-20cm)
   - [ ] Cover LDR (low light)
   - [ ] Hold for 3 seconds
   - [ ] Press destination button
   - [ ] Verify LED changes to yellow (pending)
   - [ ] Check backend for new request

2. **Status Update Test**
   - [ ] Accept ride from puller device
   - [ ] Consumer device LED turns green
   - [ ] Buzzer beeps twice
   - [ ] OLED shows "ACCEPTED!"

3. **Complete Flow Test**
   - [ ] Complete ride from puller device
   - [ ] Consumer device shows completion
   - [ ] Returns to idle state after 3 seconds

### Puller Device Testing

#### Hardware Test
1. **LED Indicators**
   - [ ] White LED = Idle
   - [ ] Yellow LED = Request available
   - [ ] Green LED = Ride active

2. **Button Functions**
   - [ ] Accept button works
   - [ ] Reject button works
   - [ ] Complete button works

#### API Communication Test
1. **Fetch Requests Test**
   - [ ] Create request from consumer
   - [ ] Puller device receives notification
   - [ ] Yellow LED lights up
   - [ ] Buzzer beeps once
   - [ ] OLED shows destination

2. **Accept Flow Test**
   - [ ] Press accept button
   - [ ] Green LED lights up
   - [ ] Backend updated
   - [ ] Consumer notified

3. **Complete Flow Test**
   - [ ] Press complete button
   - [ ] Buzzer beeps 3 times
   - [ ] OLED shows points earned
   - [ ] Returns to idle
   - [ ] Backend updated with points

---

## Integration Testing

### End-to-End Ride Flow

#### Test Case 1: Successful Ride
1. **Setup**
   - Admin approves puller
   - Consumer and puller devices online
   
2. **Request Creation**
   - Consumer triggers ride request
   - Verify request appears in backend
   - Verify puller receives notification
   
3. **Acceptance**
   - Puller accepts request
   - Verify consumer receives notification
   - Verify status updates in all places
   
4. **Completion**
   - Puller completes ride
   - Verify points awarded
   - Verify consumer can rate
   
5. **Rating**
   - Consumer submits rating
   - Verify puller rating updated
   - Verify notification sent

#### Test Case 2: Rejected Ride
1. Consumer creates request
2. Puller rejects request
3. Verify consumer notified
4. Verify request removed from pending
5. Device returns to idle

#### Test Case 3: Multiple Requests
1. Create 3 simultaneous requests
2. Verify all appear in puller dashboard
3. Accept one request
4. Verify others still available
5. Complete accepted ride
6. Accept another request

### Multi-User Scenarios

#### Test Case 4: Multiple Pullers
1. Two pullers online
2. Consumer creates request
3. Both pullers see request
4. First puller accepts
5. Request disappears for second puller
6. Verify data consistency

#### Test Case 5: Multiple Consumers
1. Three consumers create requests
2. Single puller accepts all three sequentially
3. Verify each transaction completes correctly
4. Verify points accumulate correctly

---

## Load Testing

### Backend Load Test

#### Using Apache Bench
```bash
# Test login endpoint
ab -n 1000 -c 10 -p login.json -T application/json \
   http://localhost:8000/auth/login

# Test analytics endpoint
ab -n 500 -c 5 http://localhost:8000/analytics/dashboard
```

#### Using Python script
```python
import requests
import time
import concurrent.futures

def create_request(i):
    response = requests.get(
        f"http://localhost:8000/request/create?destination=TEST{i}"
    )
    return response.status_code

# Test with 100 concurrent requests
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    futures = [executor.submit(create_request, i) for i in range(100)]
    results = [f.result() for f in concurrent.futures.as_completed(futures)]

print(f"Success rate: {results.count(200)/len(results)*100}%")
```

### Expected Performance
- **API Response Time**: < 100ms
- **Database Query Time**: < 50ms
- **Concurrent Users**: Support 50+ simultaneous users
- **Request Throughput**: 100+ requests/second

---

## Automated Testing

### Backend Unit Tests
```python
# test_backend.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "CUET IOTRIX Phase 2" in response.json()["message"]

def test_signup():
    response = client.post("/auth/signup", json={
        "username": "test_user",
        "password": "test123",
        "role": "consumer"
    })
    assert response.status_code == 200
    assert response.json()["username"] == "test_user"

def test_analytics():
    response = client.get("/analytics/dashboard")
    assert response.status_code == 200
    assert "total_rides" in response.json()

# Run tests
# pytest test_backend.py -v
```

---

## Test Results Documentation

### Template for Test Report

```markdown
## Test Report - CUET IOTRIX Phase 2

**Date**: [DATE]
**Tester**: [NAME]
**Version**: 2.0

### Summary
- Total Tests: XX
- Passed: XX
- Failed: XX
- Pass Rate: XX%

### Backend Tests
- Authentication: ✅ All passed
- Admin Operations: ✅ All passed
- Ride Management: ⚠️ 1 warning
- Analytics: ✅ All passed

### Frontend Tests
- Admin Dashboard: ✅ All passed
- Puller Dashboard: ✅ All passed
- Consumer Dashboard: ✅ All passed

### ESP32 Tests
- Consumer Device: ✅ All passed
- Puller Device: ⚠️ 1 warning

### Issues Found
1. [Description of any issues]

### Recommendations
1. [Any recommendations]
```

---

## Continuous Testing

### Pre-Deployment Checklist
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Load tests meet requirements
- [ ] ESP32 devices tested
- [ ] Frontend UI verified
- [ ] Security tests completed
- [ ] Documentation updated

### Regular Testing Schedule
- **Daily**: Smoke tests
- **Weekly**: Full test suite
- **Monthly**: Load and performance tests
- **Quarterly**: Security audit

---

**Test coverage goal**: 80%+  
**Last Updated**: November 2025
