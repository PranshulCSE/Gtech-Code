import {Routes, Route} from 'react-router'
import Homepage from './pages/Homepage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ResetPassword from './pages/ResetPassword'
import ForgotPassword from './pages/ForgotPassword'


function App() {


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
