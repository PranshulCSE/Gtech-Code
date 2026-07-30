import { Routes, Route, Navigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from "react";
import Homepage from './pages/Homepage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ResetPassword from './pages/ResetPassword'
import ForgotPassword from './pages/ForgotPassword'
import AdminPanel from './pages/AdminPanel'
import VerifyEmail from './pages/VerifyEmail'
import { checkAuth } from '../authSlice';
import ProblemPage from './pages/ProblemPage'
import Profile from './pages/Profile'

function App() {
  // Checking if the User is Authenticated or not
  const { isAuthenticated, checkingAuth, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch])

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <span className="loading loading-spinner loading-lg text-amber-400"></span>
      </div>
    )
  }

  const RequireAuth = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }

    return children
  }

  const RequireAdmin = ({ children }) => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return <Navigate to="/" replace />
    }

    return children
  }

  return (
    <>
      <Routes>
        <Route path='/' element={<RequireAuth><Homepage /></RequireAuth>} />
        <Route path='/login' element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path='/signup' element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} />
        <Route path='/forgot-password' element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />} />
        <Route path='/verify-email/:token' element={<VerifyEmail />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
        <Route path="/admin" element={<RequireAdmin><AdminPanel /></RequireAdmin>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/problem/:problemid" element={<RequireAuth><ProblemPage /></RequireAuth>} />
      </Routes>
    </>
  )
}

export default App
