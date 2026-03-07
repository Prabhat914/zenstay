import React, { useContext, useEffect, useState } from 'react'
import logo from '../assets/zenstay-logo.jpeg'
import { FiSearch } from "react-icons/fi";
import { GiHamburgerMenu } from "react-icons/gi";
import { CgProfile } from "react-icons/cg";
import { MdWhatshot } from "react-icons/md";
import { GiFamilyHouse } from "react-icons/gi";
import { MdBedroomParent } from "react-icons/md";
import { MdOutlinePool } from "react-icons/md";
import { GiWoodCabin } from "react-icons/gi";
import { SiHomeassistantcommunitystore } from "react-icons/si";
import { IoBedOutline } from "react-icons/io5";
import { FaTreeCity } from "react-icons/fa6";
import { BiBuildingHouse } from "react-icons/bi";
import { useNavigate } from 'react-router-dom';
import { authDataContext } from '../Context/AuthContext';
import axios from 'axios';
import { userDataContext } from '../Context/UserContext';
import { listingDataContext } from '../Context/ListingContext';
import { toast } from 'react-toastify';
function Nav() {
    let [showpopup,setShowpopup]= useState(false)
    let {userData ,setUserData}= useContext(userDataContext)
    let navigate = useNavigate()
    let {serverUrl,setAuthToken} = useContext(authDataContext)
    let [cate,setCate]= useState()
    let {listingData,setNewListData,searchData,handleSearch,handleViewCard,setSearchData}=useContext(listingDataContext)
    let [input,setInput]=useState("")
    const hasValidUser = userData && typeof userData === "object"
    const handleLogOut = async () => {
        try {
            let result = await axios.post( serverUrl + "/api/auth/logout", {withCredentials:true})
            setUserData(null)
            setAuthToken("")
            localStorage.removeItem("zenstay_token")
            localStorage.removeItem("zenstay_user")

            console.log(result)
        } catch (error) {
            console.log(error)
        }
        
    }
    const handleCategory = (category)=>{
       setCate(category)
       if(category=="trending"){
        setNewListData(
            listingData.filter(
                (list) => list.isTrending === true || /trending/i.test(String(list.title || ""))
            )
        )
       }
       else{
       setNewListData(listingData.filter((list)=>list.category==category))}

       

    }
    const handleClick = (id, listingItem = null) => {
        if (hasValidUser) {
            handleViewCard(id, listingItem)
        }
        else {
            toast.info("Please login first")
            navigate("/login")
        }
    }
    const applyLocalSearch = (queryText) => {
        const query = String(queryText || "").trim().toLowerCase()
        if (!query) {
            setNewListData(listingData)
            setSearchData([])
            return
        }
        const filtered = (listingData || []).filter((list) => {
            return [
                list.title,
                list.city,
                list.country,
                list.landMark,
                list.category
            ].some((field) => String(field || "").toLowerCase().includes(query))
        })
        setNewListData(filtered)
    }
    const runSearch = async () => {
        const query = String(input || "").trim()
        if (!query) {
            setNewListData(listingData)
            setSearchData([])
            return []
        }
        const matches = await handleSearch(query)
        applyLocalSearch(query)
        return matches
    }
    const handleSearchSubmit = async () => {
        const matches = await runSearch()
        const firstMatch = (matches || [])[0]
        if (firstMatch?._id) {
            handleClick(firstMatch._id, firstMatch)
        }
    }
    const openProtectedRoute = (path) => {
        if (!hasValidUser) {
            toast.info("Please login first")
            navigate("/login")
            setShowpopup(false)
            return
        }
        navigate(path)
        setShowpopup(false)
    }
    useEffect(()=>{
      const timer = setTimeout(() => {
        runSearch()
      }, 250)
      return () => clearTimeout(timer)
    },[input, listingData])

    return (

        <div className='fixed top-0 bg-[white] z-[20]'>
            <div className='w-[100vw] min-h-[80px]  border-b-[1px] border-[#dcdcdc] px-[20px] flex items-center justify-between md:px-[40px] '>
                <div className='group cursor-pointer'>
                    <img
                        src={logo}
                        alt="Zenstay logo"
                        className='w-[56px] h-[56px] rounded-full object-cover transition duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_12px_30px_rgba(239,68,68,0.28)]'
                    />
                </div>

                <div className='w-[35%] relative hidden md:block '>
                    <input type="text" className='w-[100%] px-[30px] py-[10px] border-[2px] border-[#bdbaba] outline-none overflow-auto rounded-[30px] text-[17px] transition duration-300 ease-out hover:border-[#ef4444] hover:shadow-[0_10px_30px_rgba(239,68,68,0.12)] focus:border-[#ef4444] focus:shadow-[0_12px_30px_rgba(239,68,68,0.18)]' placeholder='Any Where  |  Any Location  |  Any City/Country 'onChange={(e)=>setInput(e.target.value)} value={input} onKeyDown={(e)=>{if(e.key==="Enter"){e.preventDefault();handleSearchSubmit()}}}/>
                    <button className='absolute p-[10px] rounded-[50px] bg-[red] right-[3%] top-[5px] transition duration-300 ease-out hover:scale-110 hover:bg-[#b91c1c] hover:shadow-[0_10px_25px_rgba(239,68,68,0.35)]' onClick={handleSearchSubmit}><FiSearch className='w-[20px] h-[20px] text-[white]' /></button>
                </div>
                <div className='flex items-center justify-center    gap-[10px] relative'>
                    <span className='text-[18px] cursor-pointer rounded-[50px] hover:bg-[#ded9d9] px-[8px] py-[5px] hidden md:block' onClick={()=>openProtectedRoute("/listingpage1")}>List your home</span>
                    <button className='px-[20px] py-[10px] flex items-center justify-center gap-[5px] border-[1px] border-[#8d8c8c] rounded-[50px] hover:shadow-lg' onClick={()=>setShowpopup(prev =>!prev)}>
                        <span><GiHamburgerMenu className='w-[20px] h-[20px]' /></span>
                        {!hasValidUser && <span><CgProfile className='w-[23px] h-[23px]' /></span>}
                        {hasValidUser && <span className='w-[30px] h-[30px] bg-[#080808] text-[white] rounded-full flex items-center justify-center'>{userData?.name?.slice(0,1) || "U"}</span>}
                    </button>
                    {showpopup && <div className='w-[220px] h-[250px] absolute bg-slate-50 top-[110%] right-[3%] border-[1px] border-[#aaa9a9] z-10 rounded-lg md:right-[10%]'>
                        <ul className='w-[100%] h-[100%] text-[17px] flex items-start justify-around flex-col py-[10px]'>
                            {!userData && <li className='w-[100%] px-[15px] py-[10px] hover:bg-[#f4f3f3] cursor-pointer' onClick={()=>{navigate("/login");setShowpopup(false)}}>Login</li>}
                            {userData && <li className='w-[100%] px-[15px] py-[10px] hover:bg-[#f4f3f3] cursor-pointer' onClick={()=>{handleLogOut();setShowpopup(false)}}>Logout</li>}
                            <div className='w-[100%] h-[1px] bg-[#c1c0c0]'></div>
                            <li className='w-[100%] px-[15px] py-[10px] hover:bg-[#f4f3f3] cursor-pointer' onClick={()=>openProtectedRoute("/listingpage1")}>List your Home</li>
                            <li className='w-[100%] px-[15px] py-[10px] hover:bg-[#f4f3f3] cursor-pointer'onClick={()=>openProtectedRoute("/mylisting")}>My Listing</li>
                            <li className='w-[100%] px-[15px] py-[10px] hover:bg-[#f4f3f3] cursor-pointer'  onClick={()=>openProtectedRoute("/mybooking")}>MY Booking</li>
                        </ul>

                    </div>}
                </div>
               {searchData?.length>0 && <div className='w-[100vw] h-[450px]  flex flex-col gap-[20px] absolute top-[50%]  overflow-auto left-[0]   justify-start  items-center'>
                    <div className='max-w-[700px] w-[100vw] h-[300px] overflow-hidden  flex flex-col bg-[#fefdfd] p-[20px] rounded-lg border-[1px] border-[#a2a1a1] cursor-pointer'>
                        {
                            searchData.map((search)=>(
                            <div key={search._id} className='border-b border-[black] p-[10px]' onClick={()=>handleClick(search._id, search)}>
                                {search.title} in {search.city}, {search.country || "Country"}
                                 </div>
                            ))

                        }
                    </div>
                </div>}
               
               

            </div>
            <div className='w-[100%] h-[60px] flex items-center justify-center  md:hidden 
            '>
                <div className='w-[80%] relative '>
                    <input type="text" className='w-[100%] px-[30px] py-[10px] border-[2px] border-[#bdbaba] outline-none overflow-auto rounded-[30px] text-[17px] transition duration-300 ease-out hover:border-[#ef4444] hover:shadow-[0_10px_30px_rgba(239,68,68,0.12)] focus:border-[#ef4444] focus:shadow-[0_12px_30px_rgba(239,68,68,0.18)]' placeholder='Any Where  |  Any Location  |  Any City/Country ' onChange={(e)=>setInput(e.target.value)} value={input} onKeyDown={(e)=>{if(e.key==="Enter"){e.preventDefault();handleSearchSubmit()}}} />
                    <button className='absolute p-[10px] rounded-[50px] bg-[red] right-[3%] top-[5px] transition duration-300 ease-out hover:scale-110 hover:bg-[#b91c1c] hover:shadow-[0_10px_25px_rgba(239,68,68,0.35)]' onClick={handleSearchSubmit}><FiSearch className='w-[20px] h-[20px] text-[white]' /></button>
                </div>
                </div>

          
           
                

            <div className='w-[100vw] h-[85px] bg-white flex items-center justify-start cursor-pointer gap-[40px] overflow-auto md:justify-center px-[15px] '>
                <div className={`group flex items-center justify-center flex-col border-b-[1px] border-transparent text-[13px] transition duration-300 ease-out hover:-translate-y-1 hover:border-[#ef4444] hover:text-[#ef4444] ${cate=="trending"?"border-b-[1px] border-[#a6a5a5]":""}`} onClick={()=>handleCategory("trending")}>
                    <MdWhatshot className='w-[30px] h-[30px] text-black transition duration-300 ease-out group-hover:scale-110 group-hover:text-[#ef4444]' />
                    <h3>Trending</h3>
                </div>

                <div className={`group flex items-center justify-center flex-col border-b-[1px] border-transparent text-[13px] transition duration-300 ease-out hover:-translate-y-1 hover:border-[#ef4444] hover:text-[#ef4444] ${cate=="villa"?"border-b-[1px] border-[#a6a5a5]":""}`} onClick={()=>handleCategory("villa")}>
                    <GiFamilyHouse className='w-[30px] h-[30px] text-black transition duration-300 ease-out group-hover:scale-110 group-hover:text-[#ef4444]' />
                    <h3>Villa</h3>

                </div>

                <div className={`group flex items-center justify-center flex-col border-b-[1px] border-transparent text-[13px] transition duration-300 ease-out hover:-translate-y-1 hover:border-[#ef4444] hover:text-[#ef4444] ${cate=="farmHouse"?"border-b-[1px] border-[#a6a5a5]":""}`} onClick={()=>handleCategory("farmHouse")}>
                    <FaTreeCity className='w-[30px] h-[30px] text-black transition duration-300 ease-out group-hover:scale-110 group-hover:text-[#ef4444]' />
                    <h3>Farm House</h3>

                </div>

                <div className={`group flex items-center justify-center flex-col border-b-[1px] border-transparent text-[13px] transition duration-300 ease-out hover:-translate-y-1 hover:border-[#ef4444] hover:text-[#ef4444] ${cate=="poolHouse"?"border-b-[1px] border-[#a6a5a5]":""}`} onClick={()=>handleCategory("poolHouse")}>
                    <MdOutlinePool className='w-[30px] h-[30px] text-black transition duration-300 ease-out group-hover:scale-110 group-hover:text-[#ef4444]' />
                    <h3>Pool House</h3>

                </div>

                <div className={`group flex items-center justify-center flex-col border-b-[1px] border-transparent text-[13px] transition duration-300 ease-out hover:-translate-y-1 hover:border-[#ef4444] hover:text-[#ef4444] ${cate=="rooms"?"border-b-[1px] border-[#a6a5a5]":""}`} onClick={()=>handleCategory("rooms")}>
                    <MdBedroomParent className='w-[30px] h-[30px] text-black transition duration-300 ease-out group-hover:scale-110 group-hover:text-[#ef4444]' />
                    <h3>Rooms</h3>

                </div>

                <div className={`group flex items-center justify-center flex-col border-b-[1px] border-transparent text-[13px] transition duration-300 ease-out hover:-translate-y-1 hover:border-[#ef4444] hover:text-[#ef4444] ${cate=="rentalRooms"?"border-b-[1px] border-[#a6a5a5]":""}`} onClick={()=>handleCategory("rentalRooms")}>
                    <MdBedroomParent className='w-[30px] h-[30px] text-black transition duration-300 ease-out group-hover:scale-110 group-hover:text-[#ef4444]' />
                    <h3>Rental Rooms</h3>

                </div>

                <div className={`group flex items-center justify-center flex-col border-b-[1px] border-transparent text-[13px] transition duration-300 ease-out hover:-translate-y-1 hover:border-[#ef4444] hover:text-[#ef4444] ${cate=="flat"?"border-b-[1px] border-[#a6a5a5]":""}`} onClick={()=>handleCategory("flat")}>
                    <BiBuildingHouse className='w-[30px] h-[30px] text-black transition duration-300 ease-out group-hover:scale-110 group-hover:text-[#ef4444]' />
                    <h3>Flat</h3>

                </div>

                <div className={`group flex items-center justify-center flex-col border-b-[1px] border-transparent text-[13px] transition duration-300 ease-out hover:-translate-y-1 hover:border-[#ef4444] hover:text-[#ef4444] ${cate=="pg"?"border-b-[1px] border-[#a6a5a5]":""}`} onClick={()=>handleCategory("pg")}>
                    <IoBedOutline className='w-[30px] h-[30px] text-black transition duration-300 ease-out group-hover:scale-110 group-hover:text-[#ef4444]' />
                    <h3>PG</h3>

                </div>

                <div className={`group flex items-center justify-center flex-col border-b-[1px] border-transparent text-[13px] transition duration-300 ease-out hover:-translate-y-1 hover:border-[#ef4444] hover:text-[#ef4444] ${cate=="cabin"?"border-b-[1px] border-[#a6a5a5]":""}`} onClick={()=>handleCategory("cabin")}>
                    <GiWoodCabin className='w-[30px] h-[30px] text-black transition duration-300 ease-out group-hover:scale-110 group-hover:text-[#ef4444]' />
                    <h3>Cabins</h3>

                </div>

                <div className={`group flex items-center justify-center flex-col border-b-[1px] border-transparent text-[13px] transition duration-300 ease-out hover:-translate-y-1 hover:border-[#ef4444] hover:text-[#ef4444] ${cate=="shops"?"border-b-[1px] border-[#a6a5a5]":""}`} onClick={()=>handleCategory("shops")}>
                    <SiHomeassistantcommunitystore className='w-[30px] h-[30px] text-black transition duration-300 ease-out group-hover:scale-110 group-hover:text-[#ef4444]' />
                    <h3>Shops</h3>

                </div>


            </div>
        </div>
    )
}

export default Nav
