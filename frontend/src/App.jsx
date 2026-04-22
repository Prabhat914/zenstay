import React, { useContext, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'

import { ToastContainer } from 'react-toastify';
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

const ScrollToTop = () => {
  const location = useLocation()

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [location.pathname, location.search])

  return null
}

function App() {
  let {isAuthenticated} = useContext(userDataContext)
 
  return (
    <>
    <ToastContainer />
    <ScrollToTop />
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
      <Route path='/viewcard' element={<ViewCard/>}/>
      <Route path='/mybooking' element={<ProtectedRoute isAuthenticated={isAuthenticated}><MyBooking/></ProtectedRoute>}/>
      <Route path='/booked' element={<ProtectedRoute isAuthenticated={isAuthenticated}><Booked/></ProtectedRoute>}/>
      

    </Routes>
    </>
  )
}

export default App
