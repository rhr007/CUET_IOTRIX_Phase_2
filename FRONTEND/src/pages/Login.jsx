import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../utils/api'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await api.post('/auth/login', {
        username,
        password
      })
      
      Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: `Welcome back, ${response.data.username}!`,
        timer: 2000
      })
      
      onLogin(response.data)
      
      // Navigate based on role
      if (response.data.role === 'admin') {
        navigate('/admin')
      } else if (response.data.role === 'puller') {
        navigate('/puller')
      } else {
        navigate('/consumer')
      }
      
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.response?.data?.detail || 'Invalid credentials'
      })
    }
  }

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', color: '#667eea', marginBottom: '20px' }}>
          CUET IOTRIX Phase 2
        </h1>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Login</h2>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }}>
            Login
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#667eea' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
