import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../utils/api'

function AdminDashboard({ user, onLogout }) {
  const [pendingPullers, setPendingPullers] = useState([])
  const [stats, setStats] = useState(null)

  const fetchPendingPullers = async () => {
    try {
      const response = await api.get('/admin/pending')
      setPendingPullers(response.data)
    } catch (error) {
      console.error('Error fetching pending pullers:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/analytics/dashboard')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchPendingPullers()
    fetchStats()
    const interval = setInterval(() => {
      fetchPendingPullers()
      fetchStats()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleApprove = async (userId) => {
    try {
      await api.post(`/admin/approve/${userId}`)
      Swal.fire({
        icon: 'success',
        title: 'Approved!',
        text: 'Puller has been approved',
        timer: 2000
      })
      fetchPendingPullers()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not approve puller'
      })
    }
  }

  const handleReject = async (userId) => {
    try {
      await api.post(`/admin/reject/${userId}`)
      Swal.fire({
        icon: 'info',
        title: 'Rejected',
        text: 'Puller has been rejected',
        timer: 2000
      })
      fetchPendingPullers()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not reject puller'
      })
    }
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user.username}!</p>
        </div>
        <div>
          <Link to="/analytics" className="btn btn-primary" style={{ marginRight: '10px' }}>
            Analytics
          </Link>
          <button onClick={onLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.total_rides}</h3>
            <p>Total Rides</p>
          </div>
          <div className="stat-card">
            <h3>{stats.completed_rides}</h3>
            <p>Completed Rides</p>
          </div>
          <div className="stat-card">
            <h3>{stats.active_pullers}</h3>
            <p>Active Pullers</p>
          </div>
          <div className="stat-card">
            <h3>{stats.completion_rate}%</h3>
            <p>Completion Rate</p>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Pending Puller Approvals</h2>
        {pendingPullers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No pending approvals
          </p>
        ) : (
          <div className="ride-list">
            {pendingPullers.map((puller) => (
              <div key={puller.id} className="ride-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>{puller.username}</h3>
                  <p>Role: {puller.role}</p>
                </div>
                <div>
                  <button 
                    onClick={() => handleApprove(puller.id)} 
                    className="btn btn-success"
                    style={{ marginRight: '10px' }}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(puller.id)} 
                    className="btn btn-danger"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {stats && stats.top_pullers && stats.top_pullers.length > 0 && (
        <div className="card">
          <h2>Top Rated Pullers</h2>
          <div className="ride-list">
            {stats.top_pullers.map((puller) => (
              <div key={puller.id} className="ride-item">
                <h3>{puller.username}</h3>
                <p>Rating: <span className="rating-stars">{'⭐'.repeat(Math.round(puller.rating))}</span> ({puller.rating})</p>
                <p>Total Rides: {puller.total_rides} | Points: {puller.points}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
