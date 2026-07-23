import {Routes, Route} from 'react-router'
import Homepage from './pages/Homepage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ResetPassword from './pages/ResetPassword'
import ForgotPassword from './pages/ForgotPassword'
import {checkAuth} from '../authSlice';
import {useDispatch, useSelector } from 'react-redux'
import {useEffect } from "react";


function App() {

  // Checking if the User is Authenticated or not
  const {isAuthenticated} = useSelector ((state)=> state.auth);
  const dispatch = useDispatch();


  useEffect(()=>{
    dispatch (checkAuth());
  },[isAuthenticated])

  return (
    <>
    <Routes>
      <Route path='/' element={<Homepage/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/signup' element={<Signup/>} />
      <Route path='/forgot-password' element={<ForgotPassword/>} />
      <Route path='/reset-password/:token' element={<ResetPassword/>} />
  
   </Routes> 
    </>
  )
}

export default App
