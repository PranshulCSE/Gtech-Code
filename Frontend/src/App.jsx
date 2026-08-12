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
import BrowseProblems from './pages/BrowseProblems'
import AdminUpload from './components/AdminUpload'
import AdminVideo from "./components/AdminVideo"


// FIX: Move RequireAuth and RequireAdmin outside App to prevent unnecessary remounts
// These components should have stable identity across renders
const RequireAuth = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

const RequireAdmin = ({ children, isAuthenticated, user }) => {
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  return children;
}

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

  return (
    <>
      <Routes>
        <Route path='/' element={<RequireAuth isAuthenticated={isAuthenticated}><Homepage /></RequireAuth>} />
        <Route path='/login' element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path='/signup' element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} />
        <Route path='/forgot-password' element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />} />
        <Route path='/verify-email/:token' element={<VerifyEmail />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
        <Route path="/admin" element={<RequireAdmin isAuthenticated={isAuthenticated} user={user}><AdminPanel /></RequireAdmin>} />
        <Route path="/browse" element={<RequireAuth isAuthenticated={isAuthenticated}><BrowseProblems /></RequireAuth>} />
        <Route path="/admin/upload/:problemId" element={<RequireAdmin isAuthenticated={isAuthenticated} user={user}><AdminUpload /></RequireAdmin>} />
        <Route path="/profile" element={<RequireAuth isAuthenticated={isAuthenticated}><Profile /></RequireAuth>} />
        <Route path="/problem/:problemid" element={<RequireAuth isAuthenticated={isAuthenticated}><ProblemPage /></RequireAuth>} />
      </Routes>
    </>
  )
}

export default App;
