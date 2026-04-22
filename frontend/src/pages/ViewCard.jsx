import React, { useContext, useEffect, useState } from 'react'
import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { listingDataContext } from '../Context/ListingContext';
import { userDataContext } from '../Context/UserContext';
import { RxCross2 } from "react-icons/rx";
import axios from 'axios';
import { authDataContext } from '../Context/AuthContext';
import { FaStar } from "react-icons/fa";
import { bookingDataContext } from '../Context/BookingContext';
import { toast } from 'react-toastify';
import logoImage from '../assets/zenstay-logo.jpeg'
import ChatPanel from '../Component/ChatPanel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReelPlayer from '../Component/ReelPlayer';
import { categoryOptions, normalizeListingCategory, normalizeListingRecord } from '../utils/listingCategory';

const LOCAL_LISTINGS_KEY = "zenstay_local_listings"

function ViewCard() {
    let navigate=useNavigate()
    let {cardDetails, setCardDetails, buildAuthConfig, getListing, syncLocalListing, deleteLocalListing}=useContext(listingDataContext)
    const fallbackImage = logoImage
    const fallbackCard = {
        _id: "",
        title: "Zenstay Room",
        description: "Comfortable room stay.",
        rent: 0,
        city: "City",
        country: "",
        landMark: "Location",
        category: "rooms",
        image1: "",
        image2: "",
        image3: "",
        ratings: 0,
        host: ""
    }
    cardDetails = cardDetails || fallbackCard
    let {userData, getCurrentUser} = useContext(userDataContext)
    let [updatePopUp,setUpdatePopUp]= useState(false)
    let [bookingPopUp,setBookingPopUp]= useState(false)
    let [commentMessage,setCommentMessage] = useState("")
    let [submittingComment,setSubmittingComment] = useState(false)
     let [title,setTitle] = useState(cardDetails.title)
        let [description,setDescription]=useState(cardDetails.description)
        let [backEndImage1,setBackEndImage1]=useState(null)
        let [backEndImage2,setBackEndImage2]=useState(null)
        let [backEndImage3,setBackEndImage3]=useState(null)
        let [rent,setRent]=useState(cardDetails.rent)
        let [city,setCity]=useState(cardDetails.city)
        let [country,setCountry]=useState(cardDetails.country)
        let [landmark,setLandmark]=useState(cardDetails.landMark)
        let [category,setCategory]=useState(normalizeListingCategory(cardDetails.category) || "rooms")
        let {serverUrl}= useContext(authDataContext)
        let {updating,setUpdating} = useContext(listingDataContext)
        let {deleting,setDeleting} = useContext(listingDataContext)
        let [minDate,setMinDate] = useState("")
        const comments = Array.isArray(cardDetails.comments) ? cardDetails.comments : []

        let {checkIn,setCheckIn,
            checkOut,setCheckOut,
            total,setTotal,
            night,setNight,handleBooking,booking}=useContext(bookingDataContext)

            useEffect(() => {
                if(checkIn && checkOut){
                    let inDate = new Date(checkIn)
                    let OutDate = new Date(checkOut)
                    let n = (OutDate - inDate)/(24*60*60*1000)
                    setNight(n)
                    let airBnbCharge = (cardDetails.rent*(7/100))
                    let tax = (cardDetails.rent*(7/100))

                    if(n>0){
                        setTotal((cardDetails.rent * n) + airBnbCharge + tax)
                    }
                    else{
                        setTotal(0)
                    }

                } else { setTotal(0); setNight(0); }

            },[checkIn,checkOut,cardDetails.rent,total])

    useEffect(() => {
        setTitle(cardDetails.title)
        setDescription(cardDetails.description)
        setRent(cardDetails.rent)
        setCity(cardDetails.city)
        setCountry(cardDetails.country)
        setLandmark(cardDetails.landMark)
        setCategory(normalizeListingCategory(cardDetails.category) || "rooms")
    }, [cardDetails])

    const listingId = String(cardDetails?._id || "")
    const isLocalListing = listingId.startsWith("local-") || listingId.startsWith("demo-")
    const isDemoListing = listingId.startsWith("demo-")

    const saveLocalListingDetails = (nextListing) => {
        syncLocalListing(nextListing)
    }

    const refreshListingDetails = async () => {
        const result = await axios.get(serverUrl + `/api/listing/findlistingbyid/${cardDetails._id}`, { withCredentials: true })
        const normalizedListing = normalizeListingRecord(result.data)
        setCardDetails(normalizedListing)
        return normalizedListing
    }

    const renderPrimaryImage = () => (
        <img
            src={cardDetails.image1 || fallbackImage}
            onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src=fallbackImage}}
            alt={cardDetails.title || "Listing"}
            className='w-[100%] h-[100%] object-cover'
        />
    )

   

   
    const handleUpdateListing =async () => {
         setUpdating(true)
        try {

            let formData = new FormData()
     formData.append("title",title)
     if(backEndImage1){formData.append("image1",backEndImage1)}
     if(backEndImage2){formData.append("image2",backEndImage2)}
     if(backEndImage3){formData.append("image3",backEndImage3)}
     formData.append("description",description)
     formData.append("rent",rent)
     formData.append("city",city)
     formData.append("country",country)
     formData.append("landMark",landmark)
     formData.append("category",category)
    
        
        let result = await axios.post(serverUrl + `/api/listing/update/${cardDetails._id}`, formData, buildAuthConfig())
        setUpdating(false)
        console.log(result)
        await refreshListingDetails()
        await getListing()
        await getCurrentUser()
        setUpdatePopUp(false)
        toast.success("Lising Updated")
       setBackEndImage1(null)
       setBackEndImage2(null)
       setBackEndImage3(null)
       
            
        } catch (error) {
            setUpdating(false)
            console.log(error)
            toast.error(error?.response?.data?.message || "Unable to update listing")
        }
        
     }
     const handleDeleteListing = async () => {
        setDeleting(true)
        try {
            if (isLocalListing) {
                deleteLocalListing(cardDetails._id)
                navigate("/")
                toast.success("Listing deleted")
                setDeleting(false)
                return
            }
            let result = await axios.delete(serverUrl + `/api/listing/delete/${cardDetails._id}`, buildAuthConfig())
            console.log(result.data)
            await getListing()
            await getCurrentUser()
            navigate("/")
            toast.success("Listing Delete")
            setDeleting(false)
        } catch (error) {
            console.log(error)
            setDeleting(false)
            toast.error(error?.response?.data?.message || "Unable to delete listing")
        }
        
     }
    const handleAddComment = async () => {
        if (!String(commentMessage || "").trim()) {
            return toast.error("Comment cannot be empty")
        }
        setSubmittingComment(true)
        try {
            if (isLocalListing) {
                const nextComment = {
                    _id: `local-comment-${Date.now()}`,
                    user: userData?._id || "local-user",
                    userName: userData?.name || "User",
                    message: String(commentMessage || "").trim(),
                    createdAt: new Date().toISOString()
                }
                const nextListing = {
                    ...cardDetails,
                    comments: [...comments, nextComment]
                }
                saveLocalListingDetails(nextListing)
                setCommentMessage("")
                toast.success("Comment added")
                return
            }
            await axios.post(serverUrl + `/api/listing/comment/${cardDetails._id}`, {
                message: commentMessage
            }, buildAuthConfig())
            await refreshListingDetails()
            setCommentMessage("")
            toast.success("Comment added")
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || "Unable to add comment")
        } finally {
            setSubmittingComment(false)
        }
     }

     const handleDeleteComment = async (commentId) => {
        try {
            if (isLocalListing) {
                const nextListing = {
                    ...cardDetails,
                    comments: comments.filter((comment) => String(comment?._id) !== String(commentId))
                }
                saveLocalListingDetails(nextListing)
                toast.success("Comment deleted")
                return
            }
            const result = await axios.delete(serverUrl + `/api/listing/comment/${cardDetails._id}/${commentId}`, buildAuthConfig())
            setCardDetails((prev) => ({ ...(prev || {}), comments: result.data?.comments || [] }))
            toast.success("Comment deleted")
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || "Unable to delete comment")
        }
     }
     const handleImage1 = (e)=>{
        let file = e.target.files[0]
        setBackEndImage1(file)
        
    }
    const handleImage2 = (e)=>{
        let file = e.target.files[0]
        setBackEndImage2(file)
        
    }
    const handleImage3 = (e)=>{
        let file = e.target.files[0]
        setBackEndImage3(file)
        
    }
        
    
  return (
    <div className='w-[100%] h-[100vh] bg-[white] flex items-center justify-center gap-[10px] flex-col overflow-auto  relative'>
             <div className='w-[50px] h-[50px] bg-[red] cursor-pointer absolute top-[5%] left-[20px] rounded-[50%] flex items-center justify-center' onClick={()=>navigate("/")}><FaArrowLeftLong className='w-[25px] h-[25px] text-[white]' /></div>
    
             <div className='w-[95%]  flex items-start justify-start text-[25px] md:w-[80%] mb-[10px]'>
                <h1 className='text-[20px]  text-[#272727] md:text-[30px] text-ellipsis text-nowrap overflow-hidden px-[70px] md:px-[0px]'>
                    {`In ${cardDetails.landMark.toUpperCase()} , ${cardDetails.city.toUpperCase()}${cardDetails.country ? `, ${String(cardDetails.country).toUpperCase()}` : ""}`}
                </h1>
             </div>
    
             <div className='w-[95%] h-[400px] flex items-center justify-center flex-col md:w-[80%] md:flex-row '>
                <div className='w-[100%]  h-[65%]  md:w-[70%] md:h-[100%] overflow-hidden flex items-center justify-center border-[2px] border-[white] '>
                    {cardDetails.reel || cardDetails.video ? (
                        <ReelPlayer url={cardDetails.reel || cardDetails.video} fallback={renderPrimaryImage()} />
                    ) : (
                        renderPrimaryImage()
                    )}
                </div>
                <div className='w-[100%] h-[50%]  flex  items-center justify-center md:w-[50%] md:h-[100%] md:flex-col '>
                    <div className='w-[100%] h-[100%]  overflow-hidden  flex items-center justify-center border-[2px] '>
                    <img src={cardDetails.image2 || fallbackImage} onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src=fallbackImage}} alt="" className='w-[100%]' />
                    </div>
                    <div className='w-[100%] h-[100%]  overflow-hidden  flex items-center justify-center border-[2px] '>
                    <img src={cardDetails.image3 || fallbackImage} onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src=fallbackImage}} alt="" className='w-[100%]' />
                    </div>
                </div>
               
             </div>
             <div className='w-[95%] flex items-start justify-start text-[18px] md:w-[80%] md:text-[25px]'>{`${cardDetails.title.toUpperCase()} ${cardDetails.category.toUpperCase()} , ${cardDetails.landMark.toUpperCase()}`}</div>
             <div className='w-[95%] flex items-start justify-start text-[18px] md:w-[80%] md:text-[25px] text-gray-800'>{cardDetails.description}</div>
             <div className='w-[95%] flex items-start justify-start text-[18px] md:w-[80%] md:text-[25px]'>{`Rs.${cardDetails.rent}/day`}</div>
             {isDemoListing && (
                <div className='w-[95%] md:w-[80%] rounded-lg border border-[#f1d5ae] bg-[#fff8ec] px-[16px] py-[12px] text-[14px] text-[#7a5830]'>
                    This is a demo listing preview. Real booking and live chat are available on backend listings only.
                </div>
             )}
             
             {/* Map Section */}
             {cardDetails.mapUrl && (
                <div className='w-[95%] md:w-[80%] mt-[20px]'>
                    <h2 className='text-[22px] font-semibold mb-[10px]'>Location</h2>
                    <div className='w-full h-[300px] rounded-xl overflow-hidden border border-gray-200'>
                        <iframe src={cardDetails.mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
                    </div>
                </div>
             )}

             <div className='w-[95%] max-w-[900px] flex items-start justify-start flex-col gap-[12px] md:w-[80%] mt-[10px]'>
                <h2 className='text-[22px] font-semibold'>Comments</h2>
                <div className='w-[100%] flex flex-col gap-[10px] rounded-lg border border-[#ddd] p-[15px] bg-[#fafafa]'>
                    <textarea
                        className='w-[100%] min-h-[100px] border border-[#bbb] rounded-lg px-[14px] py-[10px]'
                        placeholder='Write your comment here'
                        value={commentMessage}
                        onChange={(e)=>setCommentMessage(e.target.value)}
                    />
                    <button className='w-fit px-[24px] py-[10px] bg-[red] text-[white] rounded-lg' onClick={handleAddComment} disabled={submittingComment || !userData?._id}>
                        {submittingComment ? "Posting..." : "Post Comment"}
                    </button>
                    {!userData?._id && <p className='text-[14px] text-[#666]'>Login required to add a comment.</p>}
                </div>
                <div className='w-[100%] flex flex-col gap-[10px]'>
                    {comments.length === 0 && <p className='text-[16px] text-[#666]'>No comments yet.</p>}
                    {comments.map((comment) => (
                        <div key={comment._id || `${comment.user}-${comment.createdAt}`} className='w-[100%] rounded-lg border border-[#e2e2e2] p-[14px] bg-white'>
                            <div className='flex items-center justify-between gap-[10px]'>
                                <span className='font-semibold text-[16px]'>{comment.userName || comment.user?.name || "User"}</span>
                                <div className='flex items-center gap-[10px]'>
                                    <span className='text-[13px] text-[#777]'>{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}</span>
                                    {String(comment.user?._id || comment.user) === String(userData?._id) && (
                                        <button className='text-[13px] text-[red]' onClick={()=>handleDeleteComment(comment._id)}>
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className='mt-[8px] text-[15px] text-[#333]'>{comment.message}</p>
                        </div>
                    ))}
                </div>
             </div>

             <ChatPanel
                cardDetails={cardDetails}
                userData={userData}
                serverUrl={serverUrl}
                buildAuthConfig={buildAuthConfig}
                isLocalListing={isLocalListing}
             />
                 
             <div className='w-[95%] h-[50px] flex items-center justify-start gap-[15px] px-[110px]'>{cardDetails.host == userData?._id &&<button className='px-[30px] py-[10px] bg-[red] text-[white] text-[18px] md:px-[100px] rounded-lg  text-nowrap' onClick={()=>setUpdatePopUp(prev => !prev)}> 
              Edit listing
             </button>}
             {cardDetails.host == userData?._id && <button className='px-[30px] py-[10px] bg-black text-[white] text-[18px] md:px-[100px] rounded-lg text-nowrap' onClick={handleDeleteListing} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete listing"}
             </button>}
             {!isDemoListing && cardDetails.host != userData?._id && <button className='px-[30px] py-[10px] bg-[red] text-[white] text-[18px] md:px-[100px] rounded-lg   text-nowrap' onClick={()=>{
                if (!userData?._id) {
                    toast.info("Please login first")
                    navigate("/login")
                    return
                }
                setBookingPopUp(prev => !prev)
             }}> 
                Reserve
             </button>}
             </div>

             {/* Update Listing Page */}

            {updatePopUp && <div className='w-[100%] h-[100%] flex items-center justify-center  bg-[#000000c6] absolute top-[0px] z-[100] backdrop-blur-sm'>
                
                <RxCross2 className='w-[30px] h-[30px] bg-[red] cursor-pointer absolute top-[6%] left-[25px] rounded-[50%] flex items-center justify-center' onClick={()=>setUpdatePopUp(false)}/>
                 
                  <form action="" className='max-w-[900px] w-[90%] h-[550px] flex items-center justify-start flex-col  gap-[10px] overflow-auto mt-[50px] text-white bg-[#272727] p-[20px] rounded-lg' onSubmit={(e)=>{e.preventDefault()}} 
                         >
                             
                             <div className='w-[200px] h-[50px] text-[20px] bg-[#f14242] text-[white] flex items-center justify-center rounded-[30px] absolute top-[5%] right-[10px] shadow-lg'>
                                 Update your details
                             </div>
                             <div className='w-[90%] flex items-start justify-start flex-col gap-[10px]'>
                               <label htmlFor="title" className='text-[20px]'>Title</label>
                               <input type="text" id='title' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px] text-[black]' required placeholder='_bhk house or best title ' onChange={(e)=>setTitle(e.target.value)} value={title}/>
                             </div> 
                 
                             <div className='w-[90%] flex items-start justify-start flex-col gap-[10px]'>
                               <label htmlFor="des" className='text-[20px]'>Description</label>
                               <textarea name="" id="des" className='w-[90%] h-[80px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px] text-[black]' required onChange={(e)=>setDescription(e.target.value)} value={description}  ></textarea>
                             </div> 
                 
                             <div className='w-[90%] flex items-start justify-center flex-col gap-[10px]'>
                               <label htmlFor="img1" className='text-[20px]'>Image1</label>
                               <div className='flex items-center justify-start  w-[90%] h-[40px] border-[#555656] border-2 rounded-[10px] '><input type="file" id='img1' className='w-[100%] text-[15px] px-[10px] ' onChange={handleImage1} />
                               </div>
                             </div> 
                 
                             <div className='w-[90%] flex items-start justify-center flex-col gap-[10px]'>
                               <label htmlFor="img2" className='text-[20px]'>Image2</label>
                               <div className='flex items-center justify-start  w-[90%] h-[40px] border-[#555656] border-2 rounded-[10px]'><input type="file" id='img2' className='w-[100%] text-[15px] px-[10px] ' onChange={handleImage2} />
                               </div>
                             </div> 
                 
                             <div className='w-[90%] flex items-start justify-center flex-col gap-[10px]'>
                               <label htmlFor="img3" className='text-[20px]'>Image3</label>
                               <div className='flex items-center justify-start  w-[90%] h-[40px] border-[#555656] border-2 rounded-[10px]'><input type="file" id='img3' className='w-[100%] text-[15px] px-[10px] ' onChange={handleImage3}  />
                               </div>
                             </div> 
                 
                             <div className='w-[90%] flex items-start justify-start flex-col gap-[10px]'>
                               <label htmlFor="rent" className='text-[20px]'>Rent</label>
                               <input type="number" id='rent' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px] text-[black]' required placeholder='Rs.______/day' onChange={(e)=>setRent(e.target.value)} value={rent}/>
                             </div> 
                 
                             <div className='w-[90%] flex items-start justify-start flex-col gap-[10px]'>
                               <label htmlFor="city" className='text-[20px]'>City</label>
                               <input type="text" id='city' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px] text-[black]' placeholder='City' onChange={(e)=>setCity(e.target.value)} value={city}/>
                             </div> 

                             <div className='w-[90%] flex items-start justify-start flex-col gap-[10px]'>
                               <label htmlFor="country" className='text-[20px]'>Country</label>
                               <input type="text" id='country' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px] text-[black]' placeholder='Country' onChange={(e)=>setCountry(e.target.value)} value={country}/>
                             </div>
                 
                             <div className='w-[90%] flex items-start justify-start flex-col gap-[10px]'>
                               <label htmlFor="landmark" className='text-[20px]'>Landmark</label>
                               <input type="text" id='landmark' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px] text-[black]' required onChange={(e)=>setLandmark(e.target.value)} value={landmark}/>
                 
                             </div> 

                             <div className='w-[90%] flex items-start justify-start flex-col gap-[10px]'>
                               <label htmlFor="category" className='text-[20px]'>Category</label>
                               <select id='category' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px] text-[black]' onChange={(e)=>setCategory(e.target.value)} value={category}>
                                {categoryOptions.map((item) => (
                                    <option key={item.key} value={item.key}>{item.label}</option>
                                ))}
                               </select>
                             </div>
                 <div className='w-[100%] flex items-center justify-center gap-[30px] mt-[20px]'>
                             <button className='px-[10px] py-[10px] bg-[red] text-[white] text-[15px] md:px-[100px] rounded-lg md:text-[18px] text-nowrap  ' onClick={handleUpdateListing} disabled={updating}>{updating?"updating...":"Update Listing"}</button>
                             <button className='px-[10px] py-[10px] bg-[red] text-[white] text-[15px] md:px-[100px] md:text-[18px] rounded-lg  text-nowrap 'onClick={handleDeleteListing} disabled={deleting}>{deleting?"Deleting...":"Delete Listing"}</button>
                             </div>
                 
                 
                 
                 
                         </form>


                </div>}

                {bookingPopUp && <div className='w-[100%] min-h-[100%] flex items-center justify-center flex-col gap-[30px] bg-[#ffffffcd] absolute top-[0px] z-[100] p-[20px] backdrop-blur-sm md:flex-row md:gap-[100px]'>
                    <RxCross2 className='w-[30px] h-[30px] bg-[red] cursor-pointer absolute top-[6%] left-[25px] rounded-[50%] flex items-center justify-center' onClick={()=>setBookingPopUp(false)}/>
                       
                        <form className='max-w-[450px] w-[90%] h-[450px] overflow-auto bg-[#f7fbfcfe] p-[20px] rounded-lg flex items-center justify-start flex-col gap-[10px]    border-[1px] border-[#dedddd]' onSubmit={(e)=>{
                            e.preventDefault()
                        }}>
                            <h1 className='w-[100%] flex items-center justify-center py-[10px] text-[25px] border-b-[1px] border-[#a3a3a3]'>Confirm & Book</h1>
                            <div className='w-[100%] h-[70%] mt-[10px] rounded-lg p-[10px]'>
                                   <h3 className='text-[19px] font-semibold'> Your Trip -</h3>
                                   <div className='w-[90%] flex items-center justify-start] gap-[24px] mt-[20px] md:justify-center flex-col md:flex-row md:items-start'>
                               <label htmlFor="checkin" className='text-[18px] md:text-[20px]'>CheckIn</label>
                               <DatePicker
                                    selected={checkIn}
                                    onChange={(date) => setCheckIn(date)}
                                    selectsStart
                                    startDate={checkIn}
                                    endDate={checkOut}
                                    minDate={new Date()} // Today's date
                                    placeholderText="Check-in Date"
                                    dateFormat="yyyy/MM/dd"
                                    className='border-[#555656] border-2 w-[200px] h-[40px] rounded-[10px] bg-transparent px-[10px] text-[15px] md:text-[18px]'
                                    required
                                />
                 
                             </div> 
                             <div className='w-[90%] flex items-center justify-start] gap-[10px] mt-[40px] md:justify-center flex-col md:flex-row md:items-start'>
                               <label htmlFor="checkOut" className='text-[18px] md:text-[20px]'>CheckOut</label>
                               <DatePicker
                                    selected={checkOut}
                                    onChange={(date) => setCheckOut(date)}
                                    selectsEnd
                                    startDate={checkIn}
                                    endDate={checkOut}
                                    minDate={checkIn} // Check-out cannot be before check-in
                                    placeholderText="Check-out Date"
                                    dateFormat="yyyy/MM/dd"
                                    className='border-[#555656] border-2 w-[200px] h-[40px] rounded-[10px] bg-transparent px-[10px] text-[15px] md:text-[18px]'
                                    required
                                />

                 
                             </div> 
                             <div className='w-[100%] flex items-center justify-center'>
                             <button className='px-[80px] py-[10px] bg-[red] text-[white] text-[18px] md:px-[100px]  rounded-lg  text-nowrap mt-[30px] ' onClick={()=>{handleBooking(cardDetails._id)}} disabled={booking}>{booking?"Booking...":"Book Now"}</button>
                             </div>
                                   
                            </div>


                        </form>

                        <div className='max-w-[450px] w-[90%] h-[450px]  bg-[#f7fbfcfe] p-[20px] rounded-lg flex items-center justify-center flex-col gap-[10px]   border-[1px] border-[#e2e1e1]'>
                            <div className='w-[95%] h-[30%] border-[1px] border-[#9b9a9a] rounded-lg flex justify-center items-center gap-[8px] p-[20px] overflow-hidden'>

                                <div className='w-[70px] h-[90px] flex items-center justify-center flex-shrink-0 rounded-lg md:w-[100px] md:h-[100px]'><img className='w-[100%] h-[100%] rounded-lg' src={cardDetails.image1 || fallbackImage} onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src=fallbackImage}} alt="" /></div>
                                <div className='w-[80%] h-[100px] gap-[5px]'>
                                <h1 className='w-[90%] truncate'>{`IN ${cardDetails.landMark.toUpperCase()}, ${cardDetails.city.toUpperCase()}${cardDetails.country ? `, ${String(cardDetails.country).toUpperCase()}` : ""}`}</h1>
                                <h1>{cardDetails.title.toUpperCase()}</h1>
                                <h1>{cardDetails.category.toUpperCase()}</h1>
                                <h1 className='flex items-center justify-start gap-[5px]'><FaStar className='text-[#eb6262]' />{cardDetails.ratings}</h1>
                            </div>
                                </div>
                                <div className=' w-[95%] h-[60%] border-[1px] border-[#abaaaa] rounded-lg flex justify-start items-start p-[20px] gap-[15px] flex-col'>
                                    <h1 className='text-[22px] font-semibold'>Booking Price - </h1>
                                    <p className='w-[100%] flex justify-between items-center px-[20px]'>
                                        <span className='font-semibold'>
                                            {`₹${cardDetails.rent} X ${night} nights`}
                                        </span>
                                        <span>{cardDetails.rent*night}</span>
                
                                    </p>
                                    <p className='w-[100%] flex justify-between items-center px-[20px]'>
                                        <span className='font-semibold'>
                                            Tax
                                        </span>
                                        <span>{cardDetails.rent*7/100}</span>
                
                                    </p>
                                    <p className='w-[100%] flex justify-between items-center px-[20px] border-b-[1px] border-gray-500 pb-[10px]'>
                                        <span className='font-semibold'>
                                            Zenstay Charge
                                        </span>
                                        <span>{cardDetails.rent*7/100}</span>
                
                                    </p>
                                    <p className='w-[100%] flex justify-between items-center px-[20px]'>
                                        <span className='font-semibold'>
                                            Total Price
                                        </span>
                                        <span>{total}</span>
                
                                    </p>
 
                                </div>
                                

                        </div>

                    </div>}

             
          
        </div>
        
  )
}


export default ViewCard
