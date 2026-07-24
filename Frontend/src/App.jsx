import {Routes, Route , Navigate } from 'react-router'
import Homepage from './pages/Homepage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ResetPassword from './pages/ResetPassword'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmail from './pages/VerifyEmail'
import {checkAuth} from '../authSlice';
import {useDispatch, useSelector } from 'react-redux'
import {useEffect } from "react";


function App() {

  // Checking if the User is Authenticated or not
  const {isAuthenticated} = useSelector ((state)=> state.auth);
  const dispatch = useDispatch();


  useEffect(()=>{
    dispatch (checkAuth());
  },[dispatch])

  return (
    <>
    <Routes>
      <Route path='/' element={isAuthenticated ? <Homepage/>: <Navigate to = "/signup"/>} />
        <Route path='/login' element={isAuthenticated ? <Navigate to ="/" /> : <Login/>} />
        <Route path='/signup' element={isAuthenticated ? <Navigate to="/" /> : <Signup/>} />
        <Route path='/forgot-password' element={isAuthenticated ? <Navigate to="/" /> : <ForgotPassword/>} />
        <Route path='/verify-email/:token' element={<VerifyEmail/>} />
      <Route path='/reset-password/:token' element={<ResetPassword/>} />
  
   </Routes> 
    </>
  )
}

export default App
