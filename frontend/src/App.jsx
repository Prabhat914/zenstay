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
      <Route path='/listingpage1' 
      element={isAuthenticated ? <ListingPage1/>:<Navigate to={"/"}/>}/>
      <Route path='/listingpage2' 
      element={isAuthenticated ? <ListingPage2/>:<Navigate to={"/"}/>}/>
      <Route path='/listingpage3'
       element={isAuthenticated ? <ListingPage3/>:<Navigate to={"/"}/>}/>
      <Route path='/mylisting'
       element={isAuthenticated ? <MyListing/>:<Navigate to={"/"}/>}/>
        <Route path='/viewcard'
        element={isAuthenticated ? <ViewCard/>:<Navigate to={"/"}/>}/>
         <Route path='/mybooking'
       element={isAuthenticated ? <MyBooking/>:<Navigate to={"/"}/>}/>
       <Route path='/booked'
       element={isAuthenticated ? <Booked/>:<Navigate to={"/"}/>}/>
      

    </Routes>
    </>
  )
}

export default App
