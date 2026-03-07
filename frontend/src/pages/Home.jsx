import React, { useContext } from 'react'
import Nav from '../Component/Nav'


import Card from '../Component/Card';
import { listingDataContext } from '../Context/ListingContext';
import SiteFooter from '../Component/SiteFooter';



function Home() {
  let {newListData, listingsLoading}=useContext(listingDataContext)
  
  return (
    <div className='min-h-screen bg-white'>
     <Nav/>
     <div className='w-[100vw] min-h-[60vh] flex items-center justify-center gap-[25px] flex-wrap mt-[250px] md:mt-[180px]'>
     {listingsLoading && (
      <div className='w-[100%] flex items-center justify-center px-[20px]'>
        <div className='max-w-[420px] w-[100%] h-[220px] rounded-[24px] border border-[#ececec] bg-[linear-gradient(110deg,#f5f5f5,45%,#ffffff,55%,#f5f5f5)] bg-[length:200%_100%] animate-pulse'></div>
      </div>
     )}
     {!listingsLoading && (
      <>
     {(newListData || []).filter(Boolean).map((list)=>(
      <Card key={list._id || `${list.title}-${list.city}`} title={list.title} landMark={list.landMark} city={list.city} country={list.country} image1={list.image1} image2={list.image2} image3={list.image3} rent={list.rent} id={list._id} ratings={list.ratings} isBooked={list.isBooked} host={list.host}/>
     ))}
      </>
     )}
     </div>
     <SiteFooter />
      </div> 
  )
}

export default Home
