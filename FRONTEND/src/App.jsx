import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminDashboard from './pages/AdminDashboard'
import PullerDashboard from './pages/PullerDashboard'
import ConsumerDashboard from './pages/ConsumerDashboard'
import Analytics from './pages/Analytics'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route 
          path="/admin" 
          element={
            user && user.role === 'admin' ? 
            <AdminDashboard user={user} onLogout={handleLogout} /> : 
            <Navigate to="/login" />
          } 
        />
        
        <Route 
          path="/puller" 
          element={
            user && user.role === 'puller' ? 
            <PullerDashboard user={user} onLogout={handleLogout} /> : 
            <Navigate to="/login" />
          } 
        />
        
        <Route 
          path="/consumer" 
          element={
            user && user.role === 'consumer' ? 
            <ConsumerDashboard user={user} onLogout={handleLogout} /> : 
            <Navigate to="/login" />
          } 
        />
        
        <Route 
          path="/analytics" 
          element={
            user && user.role === 'admin' ? 
            <Analytics user={user} onLogout={handleLogout} /> : 
            <Navigate to="/login" />
          } 
        />
        
        <Route 
          path="/" 
          element={
            user ? 
              user.role === 'admin' ? <Navigate to="/admin" /> :
              user.role === 'puller' ? <Navigate to="/puller" /> :
              <Navigate to="/consumer" />
            : <Navigate to="/login" />
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
