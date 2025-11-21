import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import api from '../utils/api'

function PullerDashboard({ user, onLogout }) {
  const [pendingRequests, setPendingRequests] = useState([])
  const [acceptedRides, setAcceptedRides] = useState([])
  const [completedRides, setCompletedRides] = useState([])
  const [notifications, setNotifications] = useState([])
  const [activeTab, setActiveTab] = useState('pending')

  const fetchData = async () => {
    try {
      const [requests, accepted, completed, notifs] = await Promise.all([
        api.get('/puller/requests'),
        api.get(`/puller/accepted?puller_id=${user.id}`),
        api.get(`/puller/completed?puller_id=${user.id}`),
        api.get(`/notifications/${user.id}`)
      ])
      
      setPendingRequests(requests.data)
      setAcceptedRides(accepted.data)
      setCompletedRides(completed.data)
      setNotifications(notifs.data.filter(n => !n.is_read))
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleAccept = async (rideId) => {
    try {
      await api.post(`/puller/accept?ride_id=${rideId}&puller_id=${user.id}`)
      Swal.fire({
        icon: 'success',
        title: 'Ride Accepted!',
        timer: 2000
      })
      fetchData()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.detail || 'Could not accept ride'
      })
    }
  }

  const handleReject = async (rideId) => {
    try {
      await api.post(`/puller/reject?ride_id=${rideId}&puller_id=${user.id}`)
      Swal.fire({
        icon: 'info',
        title: 'Ride Rejected',
        timer: 2000
      })
      fetchData()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not reject ride'
      })
    }
  }

  const handleComplete = async (rideId) => {
    try {
      await api.post(`/puller/complete?ride_id=${rideId}&puller_id=${user.id}`)
      Swal.fire({
        icon: 'success',
        title: 'Ride Completed!',
        text: 'You earned 100 points!',
        timer: 2000
      })
      fetchData()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not complete ride'
      })
    }
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Puller Dashboard</h1>
          <p>Welcome, {user.username}!</p>
          <p>Points: {user.points} | Rating: ⭐ {user.rating}</p>
        </div>
        <div>
          {notifications.length > 0 && (
            <span className="notification-badge">{notifications.length}</span>
          )}
          <button onClick={onLogout} className="btn btn-secondary" style={{ marginLeft: '10px' }}>
            Logout
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee' }}>
          <button 
            onClick={() => setActiveTab('pending')}
            className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button 
            onClick={() => setActiveTab('accepted')}
            className={`btn ${activeTab === 'accepted' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Accepted Rides ({acceptedRides.length})
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`btn ${activeTab === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Completed Rides ({completedRides.length})
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="ride-list">
            {pendingRequests.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                No pending requests
              </p>
            ) : (
              pendingRequests.map((request) => (
                <div key={request.id} className="ride-item">
                  <h3>Destination: {request.destination}</h3>
                  <p>Pickup: {request.pickup_location || 'N/A'}</p>
                  <p>Requested: {new Date(request.created_at).toLocaleString()}</p>
                  <div style={{ marginTop: '10px' }}>
                    <button 
                      onClick={() => handleAccept(request.id)}
                      className="btn btn-success"
                      style={{ marginRight: '10px' }}
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleReject(request.id)}
                      className="btn btn-danger"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'accepted' && (
          <div className="ride-list">
            {acceptedRides.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                No accepted rides
              </p>
            ) : (
              acceptedRides.map((ride) => (
                <div key={ride.id} className="ride-item">
                  <h3>Destination: {ride.destination}</h3>
                  <p>Accepted: {new Date(ride.accepted_at).toLocaleString()}</p>
                  <button 
                    onClick={() => handleComplete(ride.id)}
                    className="btn btn-success"
                    style={{ marginTop: '10px' }}
                  >
                    Mark as Completed
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="ride-list">
            {completedRides.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                No completed rides yet
              </p>
            ) : (
              completedRides.map((ride) => (
                <div key={ride.id} className="ride-item">
                  <h3>Destination: {ride.destination}</h3>
                  <p>Completed: {new Date(ride.completed_at).toLocaleString()}</p>
                  {ride.rating && (
                    <p>Rating: <span className="rating-stars">{'⭐'.repeat(ride.rating)}</span></p>
                  )}
                  {ride.review && <p>Review: {ride.review}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PullerDashboard
