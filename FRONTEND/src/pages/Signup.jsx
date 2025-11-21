import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../utils/api'

function Signup() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('puller')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await api.post('/auth/signup', {
        username,
        password,
        role
      })
      
      if (role === 'puller') {
        Swal.fire({
          icon: 'info',
          title: 'Account Created!',
          text: 'Your account is pending admin approval. Please wait for confirmation.',
          confirmButtonText: 'OK'
        }).then(() => {
          navigate('/login')
        })
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Account Created!',
          text: 'You can now login with your credentials.',
          timer: 2000
        }).then(() => {
          navigate('/login')
        })
      }
      
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Signup Failed',
        text: error.response?.data?.detail || 'Could not create account'
      })
    }
  }

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', color: '#667eea', marginBottom: '20px' }}>
          CUET IOTRIX Phase 2
        </h1>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Sign Up</h2>
        
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
            minLength="6"
          />
          
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="puller">Puller (Needs Approval)</option>
            <option value="consumer">Consumer</option>
            <option value="admin">Admin</option>
          </select>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }}>
            Sign Up
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Already have an account? <Link to="/login" style={{ color: '#667eea' }}>Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
