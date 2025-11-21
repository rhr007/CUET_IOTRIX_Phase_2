import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import api from '../utils/api'

function ConsumerDashboard({ user, onLogout }) {
  const [rideHistory, setRideHistory] = useState([])
  const [notifications, setNotifications] = useState([])

  const fetchData = async () => {
    try {
      const [history, notifs] = await Promise.all([
        api.get(`/request/history?consumer_id=${user.id}`),
        api.get(`/notifications/${user.id}`)
      ])
      
      setRideHistory(history.data)
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

  const handleRateRide = async (rideId) => {
    const { value: formValues } = await Swal.fire({
      title: 'Rate Your Ride',
      html:
        '<select id="rating" class="swal2-input" required>' +
        '<option value="">Select Rating</option>' +
        '<option value="1">⭐ 1 Star</option>' +
        '<option value="2">⭐⭐ 2 Stars</option>' +
        '<option value="3">⭐⭐⭐ 3 Stars</option>' +
        '<option value="4">⭐⭐⭐⭐ 4 Stars</option>' +
        '<option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>' +
        '</select>' +
        '<textarea id="review" class="swal2-input" placeholder="Write a review (optional)"></textarea>',
      focusConfirm: false,
      preConfirm: () => {
        return {
          rating: parseInt(document.getElementById('rating').value),
          review: document.getElementById('review').value
        }
      }
    })

    if (formValues && formValues.rating) {
      try {
        await api.post('/rating/submit', {
          ride_id: rideId,
          rating: formValues.rating,
          review: formValues.review || null
        })
        
        Swal.fire({
          icon: 'success',
          title: 'Thank you!',
          text: 'Your rating has been submitted',
          timer: 2000
        })
        
        fetchData()
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.detail || 'Could not submit rating'
        })
      }
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: '#ffc107', text: 'Pending' },
      accepted: { color: '#28a745', text: 'Accepted' },
      rejected: { color: '#dc3545', text: 'Rejected' },
      completed: { color: '#667eea', text: 'Completed' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span style={{
        background: badge.color,
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {badge.text}
      </span>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Consumer Dashboard</h1>
          <p>Welcome, {user.username}!</p>
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

      {notifications.length > 0 && (
        <div className="card">
          <h2>Notifications</h2>
          <div className="ride-list">
            {notifications.map((notif) => (
              <div key={notif.id} className="ride-item" style={{ borderLeft: '4px solid #28a745' }}>
                <p><strong>{notif.message}</strong></p>
                <p style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(notif.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2>Ride History</h2>
        {rideHistory.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No rides yet. Use the ESP device to request a ride!
          </p>
        ) : (
          <div className="ride-list">
            {rideHistory.map((ride) => (
              <div key={ride.id} className="ride-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3>Destination: {ride.destination}</h3>
                    <p>Requested: {new Date(ride.created_at).toLocaleString()}</p>
                    {ride.completed_at && (
                      <p>Completed: {new Date(ride.completed_at).toLocaleString()}</p>
                    )}
                    {ride.rating && (
                      <p>Your Rating: <span className="rating-stars">{'⭐'.repeat(ride.rating)}</span></p>
                    )}
                  </div>
                  <div>
                    {getStatusBadge(ride.status)}
                  </div>
                </div>
                
                {ride.status === 'completed' && !ride.rating && (
                  <button 
                    onClick={() => handleRateRide(ride.id)}
                    className="btn btn-primary"
                    style={{ marginTop: '10px' }}
                  >
                    Rate This Ride
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConsumerDashboard
