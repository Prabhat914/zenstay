import React, { useContext } from 'react'
import Nav from '../Component/Nav'
import HomeAnimation from '../Component/HomeAnimation';


import Card from '../Component/Card';
import CardSkeleton from '../Component/CardSkeleton';
import { listingDataContext } from '../Context/ListingContext';
import SiteFooter from '../Component/SiteFooter';



function Home() {
  let {newListData, listingsLoading}=useContext(listingDataContext)
  const listings = (newListData || []).filter(Boolean)
  const featuredCount = listings.filter((item) => item.isTrending).length || listings.slice(0, 6).length
  const cityCount = new Set(listings.map((item) => String(item.city || "").trim()).filter(Boolean)).size
  
  return (
    <div className='min-h-screen bg-[linear-gradient(180deg,#f3fbfb_0%,#ffffff_30%,#f7f7fb_100%)]'>
     <Nav/>
     <main className='px-[16px] pt-[220px] pb-[24px] md:px-[28px] md:pt-[190px]'>
      <section className='max-w-[1240px] mx-auto grid grid-cols-1 gap-[18px] lg:grid-cols-[1.15fr_0.85fr]'>
        <div className='relative overflow-hidden rounded-[34px] bg-[#123b3d] text-white px-[22px] py-[24px] shadow-[0_28px_70px_rgba(18,59,61,0.24)] md:px-[34px] md:py-[38px]'>
          <HomeAnimation />
          <div className='relative z-10'>
          <div className='inline-flex items-center rounded-full bg-white/12 px-[14px] py-[8px] text-[12px] tracking-[0.24em] uppercase'>Stay Better</div>
          <h1 className='max-w-[720px] text-[36px] leading-[1.02] font-semibold mt-[16px] md:text-[58px]'>
            Book standout stays with a calmer, cleaner Zenstay experience.
          </h1>
          <p className='max-w-[620px] text-[16px] text-white/78 mt-[18px] md:text-[18px]'>
            Explore villas, farm houses, pool homes, cabins, rooms, flats, PGs, and shops in a layout designed to feel fast, airy, and easy to browse.
          </p>

          <div className='grid grid-cols-2 gap-[12px] mt-[28px] md:grid-cols-3'>
            <div className='rounded-[22px] bg-white/10 px-[16px] py-[16px] border border-white/10'>
              <div className='text-[28px] font-semibold'>{listings.length || 0}</div>
              <div className='text-[13px] uppercase tracking-[0.16em] text-white/70 mt-[4px]'>Live Stays</div>
            </div>
            <div className='rounded-[22px] bg-white/10 px-[16px] py-[16px] border border-white/10'>
              <div className='text-[28px] font-semibold'>{featuredCount}</div>
              <div className='text-[13px] uppercase tracking-[0.16em] text-white/70 mt-[4px]'>Featured Picks</div>
            </div>
            <div className='rounded-[22px] bg-white/10 px-[16px] py-[16px] border border-white/10 col-span-2 md:col-span-1'>
              <div className='text-[28px] font-semibold'>{cityCount}</div>
              <div className='text-[13px] uppercase tracking-[0.16em] text-white/70 mt-[4px]'>Cities Covered</div>
            </div>
          </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-1'>
          <div className='rounded-[30px] bg-[linear-gradient(135deg,#ffffff_0%,#eef8f8_100%)] border border-[#dceaea] px-[20px] py-[22px] shadow-[0_18px_40px_rgba(15,23,42,0.06)]'>
            <div className='text-[13px] uppercase tracking-[0.22em] text-[#5f7b7e]'>Why It Feels Better</div>
            <div className='text-[28px] text-[#173133] font-semibold mt-[10px]'>Search less, decide faster.</div>
            <p className='text-[15px] text-[#647879] mt-[10px]'>Filter by category from the top rail, search by landmark or city, and jump into details without clutter.</p>
          </div>
          <div className='rounded-[30px] bg-[linear-gradient(135deg,#fff8ef_0%,#ffffff_100%)] border border-[#f1e1cb] px-[20px] py-[22px] shadow-[0_18px_40px_rgba(15,23,42,0.06)]'>
            <div className='text-[13px] uppercase tracking-[0.22em] text-[#8a6a3d]'>Host Ready</div>
            <div className='text-[28px] text-[#3a2f21] font-semibold mt-[10px]'>List, manage, and update from one flow.</div>
            <p className='text-[15px] text-[#7d6c58] mt-[10px]'>Create a listing, manage bookings, and keep legal pages or contact messages under control from your dashboard.</p>
          </div>
        </div>
      </section>

      <section className='max-w-[1240px] mx-auto mt-[28px]'>
        <div className='flex items-end justify-between gap-[12px] flex-wrap'>
          <div>
            <div className='text-[13px] uppercase tracking-[0.22em] text-[#6b8082]'>Discover stays</div>
            <h2 className='text-[30px] md:text-[42px] font-semibold text-[#182f31] mt-[8px]'>Fresh stays and popular picks</h2>
          </div>
          <p className='max-w-[420px] text-[15px] text-[#697d7f]'>Browse the collection below. Search and category filters from the header still work exactly as before.</p>
        </div>
      </section>

      <section className='max-w-[1240px] mx-auto min-h-[60vh] mt-[22px]'>
        {listingsLoading && (
          <div className='grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-3'>
            {[1,2,3].map((item) => (
              <CardSkeleton key={item} />
            ))}
          </div>
        )}

        {!listingsLoading && (
          <div className='grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-3'>
            {listings.map((list)=>(
              <Card key={list._id || `${list.title}-${list.city}`} title={list.title} landMark={list.landMark} city={list.city} country={list.country} image1={list.image1} image2={list.image2} image3={list.image3} rent={list.rent} id={list._id} ratings={list.ratings} isBooked={list.isBooked} host={list.host} listingItem={list}/>
            ))}
          </div>
        )}
      </section>
     </main>
     <SiteFooter />
    </div> 
  )
}

export default Home
