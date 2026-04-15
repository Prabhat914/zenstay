import React, { useContext } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Home from './pages/Home'

import { ToastContainer, toast } from 'react-toastify';
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ListingPage1 from './pages/ListingPage1'
import ListingPage2 from './pages/ListingPage2'
import ListingPage3 from './pages/ListingPage3'
import { userDataContext } from './Context/UserContext'
import MyListing from './pages/MyListing'
import ViewCard from './pages/ViewCard'
import MyBooking from './pages/MyBooking'
import Booked from './pages/Booked'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsAndConditions from './pages/TermsAndConditions'
import RefundPolicy from './pages/RefundPolicy'
import AdminDashboard from './pages/AdminDashboard'


const ProtectedRoute = ({ isAuthenticated, children, adminOnly = false }) => {
  if (!isAuthenticated) return <Navigate to={adminOnly ? "/login" : "/"} />;
  return children;
};

function App() {
  let {isAuthenticated} = useContext(userDataContext)
 
  return (
    <>
    <ToastContainer />
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/signup' element={<SignUp/>}/>
      <Route path='/forgot-password' element={<ForgotPassword/>}/>
      <Route path='/reset-password' element={<ResetPassword/>}/>
      <Route path='/about-us' element={<AboutUs/>}/>
      <Route path='/contact-us' element={<ContactUs/>}/>
      <Route path='/privacy-policy' element={<PrivacyPolicy/>}/>
      <Route path='/terms-and-conditions' element={<TermsAndConditions/>}/>
      <Route path='/refund-policy' element={<RefundPolicy/>}/>
      
      <Route path='/admin' element={<ProtectedRoute isAuthenticated={isAuthenticated} adminOnly><AdminDashboard/></ProtectedRoute>}/>
      <Route path='/listingpage1' element={<ProtectedRoute isAuthenticated={isAuthenticated}><ListingPage1/></ProtectedRoute>}/>
      <Route path='/listingpage2' element={<ProtectedRoute isAuthenticated={isAuthenticated}><ListingPage2/></ProtectedRoute>}/>
      <Route path='/listingpage3' element={<ProtectedRoute isAuthenticated={isAuthenticated}><ListingPage3/></ProtectedRoute>}/>
      <Route path='/mylisting' element={<ProtectedRoute isAuthenticated={isAuthenticated}><MyListing/></ProtectedRoute>}/>
      <Route path='/viewcard' element={<ProtectedRoute isAuthenticated={isAuthenticated}><ViewCard/></ProtectedRoute>}/>
      <Route path='/mybooking' element={<ProtectedRoute isAuthenticated={isAuthenticated}><MyBooking/></ProtectedRoute>}/>
      <Route path='/booked' element={<ProtectedRoute isAuthenticated={isAuthenticated}><Booked/></ProtectedRoute>}/>
      

    </Routes>
    </>
  )
}

export default App
