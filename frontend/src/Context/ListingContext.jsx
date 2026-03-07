import axios from 'axios'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { authDataContext } from './AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import logoImage from '../assets/zenstay-logo.jpeg'

export const listingDataContext = createContext()

function ListingContext({children}) {
    let navigate = useNavigate() 
    let [title,setTitle] = useState("")
    let [description,setDescription]=useState("")
    let [frontEndImage1,setFrontEndImage1]=useState(null)
    let [frontEndImage2,setFrontEndImage2]=useState(null)
    let [frontEndImage3,setFrontEndImage3]=useState(null)
    let [backEndImage1,setBackEndImage1]=useState(null)
    let [backEndImage2,setBackEndImage2]=useState(null)
    let [backEndImage3,setBackEndImage3]=useState(null)
    let [rent,setRent]=useState("")
    let [city,setCity]=useState("")
    let [landmark,setLandmark]=useState("")
    let [category,setCategory]=useState("")
    let [adding,setAdding]=useState(false)
    let [updating,setUpdating]=useState(false)
    let [deleting,setDeleting]=useState(false)
    let [listingData,setListingData]=useState([])
    let [newListData,setNewListData]=useState([])
    let [cardDetails,setCardDetails]=useState(null)
    let [searchData,setSearchData]=useState([])
    const didShowFallbackToast = useRef(false)
    const fallbackImage = logoImage
    const demoListings = [
        {
            _id: "demo-villa-1",
            title: "Zenstay Trending Hill Villa",
            landMark: "Lonavala Lake",
            city: "Lonavala",
            country: "India",
            rent: 6200,
            ratings: 4.8,
            image1: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
            image2: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
            image3: "https://images.unsplash.com/photo-1613977257360-a3a67f7f25eb?auto=format&fit=crop&w=1200&q=80",
            isBooked: false,
            host: "demo-host",
            category: "villa",
            isTrending: true
        },
        {
            _id: "demo-villa-2",
            title: "Zenstay Palm Villa",
            landMark: "Assagao",
            city: "Goa",
            country: "India",
            rent: 5700,
            ratings: 4.6,
            image1: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            image2: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
            image3: "https://images.unsplash.com/photo-1600566753051-f0b8fba8f1f0?auto=format&fit=crop&w=1200&q=80",
            isBooked: false,
            host: "demo-host",
            category: "villa",
            isTrending: false
        },
        {
            _id: "demo-farm-1",
            title: "Zenstay Green Farm House",
            landMark: "Sohna Road",
            city: "Gurugram",
            country: "India",
            rent: 4800,
            ratings: 4.5,
            image1: "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
            image2: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
            image3: "https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=1200&q=80",
            isBooked: false,
            host: "demo-host",
            category: "farmHouse",
            isTrending: true
        },
        {
            _id: "demo-farm-2",
            title: "Zenstay Orchard Farm House",
            landMark: "Mansarovar",
            city: "Jaipur",
            country: "India",
            rent: 4300,
            ratings: 4.4,
            image1: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
            image2: "https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=80",
            image3: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
            isBooked: false,
            host: "demo-host",
            category: "farmHouse",
            isTrending: false
        },
        {
            _id: "demo-pool-1",
            title: "Zenstay Blue Pool House",
            landMark: "Calangute",
            city: "Goa",
            country: "India",
            rent: 6900,
            ratings: 4.9,
            image1: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
            image2: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
            image3: "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1200&q=80",
            isBooked: false,
            host: "demo-host",
            category: "poolHouse",
            isTrending: true
        },
        {
            _id: "demo-pool-2",
            title: "Zenstay Courtyard Pool House",
            landMark: "ECR",
            city: "Chennai",
            country: "India",
            rent: 5400,
            ratings: 4.5,
            image1: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
            image2: "https://images.unsplash.com/photo-1600607687644-c7f34b5bca9b?auto=format&fit=crop&w=1200&q=80",
            image3: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80",
            isBooked: false,
            host: "demo-host",
            category: "poolHouse",
            isTrending: false
        },
        {
            _id: "demo-rooms-1",
            title: "Zenstay Executive Rooms",
            landMark: "Cyber Hub",
            city: "Gurugram",
            country: "India",
            rent: 2600,
            ratings: 4.3,
            image1: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
            image2: "https://images.unsplash.com/photo-1616594039964-3f2b9dd2f7ab?auto=format&fit=crop&w=1200&q=80",
            image3: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
            isBooked: false,
            host: "demo-host",
            category: "rooms",
            isTrending: false
        },
        {
            _id: "demo-rooms-2",
            title: "Zenstay Lake View Rooms",
            landMark: "Fateh Sagar",
            city: "Udaipur",
            country: "India",
            rent: 3000,
            ratings: 4.6,
            image1: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
            image2: "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?auto=format&fit=crop&w=1200&q=80",
            image3: "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1200&q=80",
            isBooked: false,
            host: "demo-host",
            category: "rooms",
            isTrending: true
        },
        {
            _id: "demo-rental-1",
            title: "Zenstay Budget Rental Room",
            landMark: "Karol Bagh",
            city: "Delhi",
            country: "India",
            rent: 1800,
            ratings: 4.2,
            image1: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
            image2: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
            image3: "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?auto=format&fit=crop&w=1200&q=80",
            isBooked: false,
            host: "demo-host",
            category: "rentalRooms",
            isTrending: false
        },
        {
            _id: "demo-rental-2",
            title: "Zenstay Monthly Rental Room",
            landMark: "Banjara Hills",
            city: "Hyderabad",
            country: "India",
            rent: 2200,
            ratings: 4.4,
            image1: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
            image2: "https://images.unsplash.com/photo-1616594039964-3f2b9dd2f7ab?auto=format&fit=crop&w=1200&q=80",
            image3: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
            isBooked: false,
            host: "demo-host",
            category: "rentalRooms",
            isTrending: true
        },
        {
            _id: "demo-flat-1",
            title: "Zenstay Service Flat Central",
            landMark: "Andheri West",
            city: "Mumbai",
            country: "India",
            rent: 3400,
            ratings: 4.4,
            image1: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
            image2: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80",
            image3: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
            isBooked: false,
            host: "demo-host",
            category: "flat",
            isTrending: false
        },
        {
            _id: "demo-flat-2",
            title: "Zenstay Skyline Flat",
            landMark: "Whitefield",
            city: "Bengaluru",
            country: "India",
            rent: 3700,
            ratings: 4.5,
            image1: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
            image2: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
            image3: "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=1200&q=80",
            isBooked: false,
            host: "demo-host",
            category: "flat",
            isTrending: true
        },
        {
            _id: "demo-pg-1",
            title: "Zenstay Student PG",
            landMark: "Hinjewadi",
            city: "Pune",
            country: "India",
            rent: 1500,
            ratings: 4.1,
            image1: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
            image2: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
            image3: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
            isBooked: false,
            host: "demo-host",
            category: "pg",
            isTrending: false
        },
        {
            _id: "demo-pg-2",
            title: "Zenstay Premium PG",
            landMark: "Sector 62",
            city: "Noida",
            country: "India",
            rent: 1900,
            ratings: 4.2,
            image1: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80",
            image2: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
            image3: "https://images.unsplash.com/photo-1617104551722-3b2d5136645b?auto=format&fit=crop&w=1200&q=80",
            isBooked: false,
            host: "demo-host",
            category: "pg",
            isTrending: true
        },
        {
            _id: "demo-cabin-1",
            title: "Zenstay Pine Cabin",
            landMark: "Old Manali",
            city: "Manali",
            country: "India",
            rent: 4100,
            ratings: 4.7,
            image1: "https://images.unsplash.com/photo-1472224371017-08207f84aaae?auto=format&fit=crop&w=1200&q=80",
            image2: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=80",
            image3: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
            isBooked: false,
            host: "demo-host",
            category: "cabin",
            isTrending: false
        },
        {
            _id: "demo-cabin-2",
            title: "Zenstay Snowline Cabin",
            landMark: "Narkanda",
            city: "Shimla",
            country: "India",
            rent: 4600,
            ratings: 4.8,
            image1: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1200&q=80",
            image2: "https://images.unsplash.com/photo-1464890100898-a385f744067f?auto=format&fit=crop&w=1200&q=80",
            image3: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80",
            isBooked: false,
            host: "demo-host",
            category: "cabin",
            isTrending: true
        },
        {
            _id: "demo-shop-1",
            title: "Zenstay Retail Shop Corner",
            landMark: "MG Road",
            city: "Indore",
            country: "India",
            rent: 5200,
            ratings: 4.2,
            image1: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
            image2: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=1200&q=80",
            image3: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
            isBooked: false,
            host: "demo-host",
            category: "shops",
            isTrending: false
        },
        {
            _id: "demo-shop-2",
            title: "Zenstay High Street Shop",
            landMark: "Linking Road",
            city: "Mumbai",
            country: "India",
            rent: 6800,
            ratings: 4.6,
            image1: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80",
            image2: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1200&q=80",
            image3: "https://images.unsplash.com/photo-1561715276-a2d087060f1d?auto=format&fit=crop&w=1200&q=80",
            isBooked: false,
            host: "demo-host",
            category: "shops",
            isTrending: true
        }
    ]

    let {serverUrl} = useContext(authDataContext)

    

     const handleAddListing = async () => {
        setAdding(true)
        try {

            let formData = new FormData()
     formData.append("title",title)
     formData.append("image1",backEndImage1)
     formData.append("image2",backEndImage2)
     formData.append("image3",backEndImage3)
     formData.append("description",description)
     formData.append("rent",rent)
     formData.append("city",city)
     formData.append("landMark",landmark)
     formData.append("category",category)
        
        let result = await axios.post( serverUrl + "/api/listing/add" ,formData, {withCredentials:true}  )
        setAdding(false)
        console.log(result)
        navigate("/")
        toast.success("AddListing Successfully")
        setTitle("")
        setDescription("")
       setFrontEndImage1(null)
       setFrontEndImage2(null)
       setFrontEndImage3(null)
       setBackEndImage1(null)
       setBackEndImage2(null)
       setBackEndImage3(null)
       setRent("")
       setCity("")
       setLandmark("")
       setCategory("")
            
        } catch (error) {
            setAdding(false)
            console.log(error)
            toast.error(error.response.data.message)
        }
        
     }
     const handleViewCard = async (id, preloadedListing = null) => {
        if (preloadedListing && typeof preloadedListing === "object") {
            setCardDetails(preloadedListing)
            navigate("/viewcard")
            return
        }
        try {
            let result = await axios.get( serverUrl + `/api/listing/findlistingbyid/${id}`,{withCredentials:true})
            console.log(result.data)
            setCardDetails(result.data)
            navigate("/viewcard")
        } catch (error) {
            console.log(error)
            const fallbackListing = (listingData || []).find((item) => String(item?._id) === String(id))
            if (fallbackListing) {
                setCardDetails(fallbackListing)
                navigate("/viewcard")
                return
            }
            toast.error("Unable to open this listing right now.")
        }
        
     }
     const handleSearch = async (data) => {
        try {
            if (!String(data || "").trim()) {
                setSearchData([])
                return []
            }
            let result = await axios.get(serverUrl + "/api/listing/search", {
                params: { query: data }
            })
            const items = Array.isArray(result.data) ? result.data : []
            setSearchData(items)
            return items
        } catch (error) {
            setSearchData([])
            console.log(error)
            return []
            
        }
        
     }

     const getListing = async () => {
        try {
            let result = await axios.get( serverUrl + "/api/listing/get",{withCredentials:true, timeout: 6000})
            const items = Array.isArray(result.data) ? result.data : []
            if (items.length === 0) {
                setListingData(demoListings)
                setNewListData(demoListings)
                if (!didShowFallbackToast.current) {
                    toast.info("No backend listings found yet, showing demo cards.")
                    didShowFallbackToast.current = true
                }
                return
            }
            setListingData(items)
            setNewListData(items)
            didShowFallbackToast.current = false

        } catch (error) {
            console.log(error)
            setListingData(demoListings)
            setNewListData(demoListings)
            if (!didShowFallbackToast.current) {
                toast.error("Backend listings unavailable, showing demo cards.")
                didShowFallbackToast.current = true
            }
        }
        
     }

    useEffect(()=>{
     getListing()
    },[adding,updating,deleting])



    let value={
        title,setTitle,
        description,setDescription,
        frontEndImage1,setFrontEndImage1,
        frontEndImage2,setFrontEndImage2,
        frontEndImage3,setFrontEndImage3,
        backEndImage1,setBackEndImage1,
        backEndImage2,setBackEndImage2,
        backEndImage3,setBackEndImage3,
        rent,setRent,
        city,setCity,
        landmark,setLandmark,
        category,setCategory,
        handleAddListing,
        setAdding,adding,
        listingData,setListingData,
        getListing,
        newListData,setNewListData,
        handleViewCard,
        cardDetails,setCardDetails,
        updating,setUpdating,
        deleting,setDeleting,handleSearch,searchData,setSearchData
       

    }
  return (
    <div>
        <listingDataContext.Provider value={value}>
            {children}
        </listingDataContext.Provider>
      
    </div>
  )
}

export default ListingContext
