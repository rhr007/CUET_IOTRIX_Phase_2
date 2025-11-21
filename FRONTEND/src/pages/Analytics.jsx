import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../utils/api'

const COLORS = ['#667eea', '#28a745', '#dc3545', '#ffc107']

function Analytics({ user, onLogout }) {
  const [stats, setStats] = useState(null)
  const [ridesByStatus, setRidesByStatus] = useState([])
  const [popularDestinations, setPopularDestinations] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  const fetchAnalytics = async () => {
    try {
      const [dashboard, status, destinations, activity] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/rides-by-status'),
        api.get('/analytics/popular-destinations'),
        api.get('/analytics/recent-activity?limit=10')
      ])
      
      setStats(dashboard.data)
      
      // Transform status data for chart
      const statusData = Object.entries(status.data).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: value
      }))
      setRidesByStatus(statusData)
      
      setPopularDestinations(destinations.data)
      setRecentActivity(activity.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p>System-wide Statistics and Insights</p>
        </div>
        <div>
          <Link to="/admin" className="btn btn-primary" style={{ marginRight: '10px' }}>
            Back to Admin
          </Link>
          <button onClick={onLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>

      {stats && (
        <>
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
              <h3>{stats.pending_rides}</h3>
              <p>Pending Rides</p>
            </div>
            <div className="stat-card">
              <h3>{stats.active_pullers}</h3>
              <p>Active Pullers</p>
            </div>
            <div className="stat-card">
              <h3>{stats.total_points_awarded}</h3>
              <p>Total Points Awarded</p>
            </div>
            <div className="stat-card">
              <h3>{stats.completion_rate}%</h3>
              <p>Completion Rate</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <div className="card">
              <h2>Rides by Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ridesByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ridesByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h2>Popular Destinations</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={popularDestinations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="destination" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {stats.top_pullers && stats.top_pullers.length > 0 && (
            <div className="card" style={{ marginTop: '20px' }}>
              <h2>Top Rated Pullers</h2>
              <div className="ride-list">
                {stats.top_pullers.map((puller, index) => (
                  <div key={puller.id} className="ride-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '18px'
                      }}>
                        #{index + 1}
                      </div>
                      <div>
                        <h3>{puller.username}</h3>
                        <p>Rating: <span className="rating-stars">{'⭐'.repeat(Math.round(puller.rating))}</span> ({puller.rating})</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p><strong>{puller.total_rides}</strong> rides</p>
                      <p><strong>{puller.points}</strong> points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card" style={{ marginTop: '20px' }}>
            <h2>Recent Activity</h2>
            <div className="ride-list">
              {recentActivity.map((ride) => (
                <div key={ride.id} className="ride-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3>Destination: {ride.destination}</h3>
                      <p style={{ fontSize: '14px', color: '#666' }}>
                        Created: {new Date(ride.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: ride.status === 'completed' ? '#28a745' : 
                                  ride.status === 'accepted' ? '#ffc107' : 
                                  ride.status === 'rejected' ? '#dc3545' : '#667eea',
                      color: 'white'
                    }}>
                      {ride.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Analytics
