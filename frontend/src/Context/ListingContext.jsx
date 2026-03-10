import axios from 'axios'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { authDataContext } from './AuthContext'
import { userDataContext } from './UserContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import logoImage from '../assets/zenstay-logo.jpeg'

export const listingDataContext = createContext()
const MAX_LISTING_UPLOAD_SIZE = 1600 * 1024
const LOCAL_LISTINGS_KEY = "zenstay_local_listings"

const listingImageFallbacks = {
    villa: ["/villas/OIP.jpeg", "/villas/OIP (1).jpeg", "/villas/OIP (2).jpeg"],
    farmHouse: ["/farm-house/image.png", "/farm-house/DOC1684492990616.jpg", "/farm-house/home1548666759.avif"],
    poolHouse: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1200&q=80"
    ],
    rooms: [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1616594039964-3f2b9dd2f7ab?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80"
    ],
    flat: ["/villas/image.png", "/villas/OIP.jpeg", "/villas/OIP (3).jpeg"],
    pg: ["/farm-house/image.png", "/villas/OIP (2).jpeg", "/villas/OIP.jpeg"],
    cabin: ["/farm-house/home1548666759.avif", "/farm-house/chhattarpur farm, delhi.avif", "/farm-house/OIP (4).jpeg"],
    shops: [
        "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1561715276-a2d087060f1d?auto=format&fit=crop&w=1200&q=80"
    ]
}

const getErrorMessage = (error, fallbackMessage) => {
    const responseMessage = error?.response?.data?.message
    if (responseMessage) {
        return responseMessage
    }
    const status = error?.response?.status
    if (status === 413) {
        return "Listing images are too large. Please use smaller images and try again."
    }
    if (status) {
        return `Request failed with status ${status}`
    }
    return fallbackMessage
}

function ListingContext({children}) {
    let navigate = useNavigate() 
    const userContextValue = useContext(userDataContext) || {}
    let { userData = null, setUserData = () => {} } = userContextValue
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
    let [listingsLoading,setListingsLoading]=useState(true)
    const didShowFallbackToast = useRef(false)
    const fallbackImage = logoImage
    const demoListings = [
        {
            _id: "demo-villa-1",
            title: "Zenstay Sky Deck Villa",
            landMark: "Indiranagar",
            city: "Bengaluru",
            country: "India",
            rent: 9200,
            ratings: 4.8,
            image1: "/villas/25-ultra-luxury-villas-in-bangalore.webp",
            image2: "/villas/aede573a9f034bd2402a336467b9b9e3.jpg",
            image3: "/villas/image.png",
            isBooked: false,
            host: "demo-host",
            category: "villa",
            isTrending: true
        },
        {
            _id: "demo-villa-2",
            title: "Zenstay Palm Court Villa",
            landMark: "Candolim",
            city: "Goa",
            country: "India",
            rent: 8700,
            ratings: 4.7,
            image1: "/villas/OIP.jpeg",
            image2: "/villas/OIP (1).jpeg",
            image3: "/villas/OIP (2).jpeg",
            isBooked: false,
            host: "demo-host",
            category: "villa",
            isTrending: false
        },
        {
            _id: "demo-villa-3",
            title: "Zenstay Blue Horizon Villa",
            landMark: "Marina District",
            city: "Dubai",
            country: "UAE",
            rent: 15800,
            ratings: 4.9,
            image1: "/villas/OIP (3).jpeg",
            image2: "/villas/aede573a9f034bd2402a336467b9b9e3.jpg",
            image3: "/villas/OIP.jpeg",
            isBooked: false,
            host: "demo-host",
            category: "villa",
            isTrending: true
        },
        {
            _id: "demo-villa-4",
            title: "Zenstay Island Escape Villa",
            landMark: "Paradise Lagoon",
            city: "Nassau",
            country: "Bahamas",
            rent: 18200,
            ratings: 4.8,
            image1: "/villas/nude-beach-in-Bahamas-6--1024x732.jpg",
            image2: "/villas/image.png",
            image3: "/villas/OIP (1).jpeg",
            isBooked: false,
            host: "demo-host",
            category: "villa",
            isTrending: false
        },
        {
            _id: "demo-villa-5",
            title: "Zenstay Poolside Manor Villa",
            landMark: "Palm Jumeirah",
            city: "Dubai",
            country: "UAE",
            rent: 17100,
            ratings: 4.9,
            image1: "/villas/image.png",
            image2: "/villas/25-ultra-luxury-villas-in-bangalore.webp",
            image3: "/villas/OIP (2).jpeg",
            isBooked: false,
            host: "demo-host",
            category: "villa",
            isTrending: false
        },
        {
            _id: "demo-farm-1",
            title: "Zenstay Orchard Farm House",
            landMark: "Kharar Estate",
            city: "Mohali",
            country: "India",
            rent: 7600,
            ratings: 4.7,
            image1: "/farm-house/baag_e_fursat_aann_space_kharar_punjab_india-20.jpg",
            image2: "/farm-house/DOC1684492990616.jpg",
            image3: "/farm-house/home1548666759.avif",
            isBooked: false,
            host: "demo-host",
            category: "farmHouse",
            isTrending: true
        },
        {
            _id: "demo-farm-2",
            title: "Zenstay Rain Studio Farm House",
            landMark: "Karjat Hills",
            city: "Karjat",
            country: "India",
            rent: 8100,
            ratings: 4.8,
            image1: "/farm-house/image.png",
            image2: "/farm-house/karai_farmhouse_rain_studio_of_design_india_12.jpg",
            image3: "/farm-house/New20farmhouse208.webp",
            isBooked: false,
            host: "demo-host",
            category: "farmHouse",
            isTrending: false
        },
        {
            _id: "demo-farm-3",
            title: "Zenstay Meadow Farm Retreat",
            landMark: "Village Greens",
            city: "Nashik",
            country: "India",
            rent: 6900,
            ratings: 4.6,
            image1: "/farm-house/OIP (4).jpeg",
            image2: "/farm-house/b19db734d4510145ea3dbb0d69726cc4.jpg",
            image3: "/farm-house/chhattarpur farm, delhi.avif",
            isBooked: false,
            host: "demo-host",
            category: "farmHouse",
            isTrending: false
        },
        {
            _id: "demo-farm-4",
            title: "Zenstay Chhattarpur Farm Escape",
            landMark: "Chhattarpur",
            city: "Delhi",
            country: "India",
            rent: 8800,
            ratings: 4.8,
            image1: "/farm-house/chhattarpur farm, delhi.avif",
            image2: "/farm-house/b19db734d4510145ea3dbb0d69726cc4.jpg",
            image3: "/farm-house/DOC1684492990616.jpg",
            isBooked: false,
            host: "demo-host",
            category: "farmHouse",
            isTrending: true
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
    const mergeListings = (items = []) => {
        const backendItems = Array.isArray(items) ? items.filter(Boolean) : []
        const seenIds = new Set(backendItems.map((item) => String(item?._id || "")))
        const missingDemoItems = demoListings.filter((item) => !seenIds.has(String(item?._id || "")))
        return [...backendItems, ...missingDemoItems]
    }

    let {serverUrl} = useContext(authDataContext)
    const buildAuthConfig = () => {
        const token = localStorage.getItem("zenstay_token") || ""
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        return { withCredentials: true, headers }
    }

    const getStoredLocalListings = () => {
        try {
            const raw = localStorage.getItem(LOCAL_LISTINGS_KEY)
            const parsed = JSON.parse(raw || "[]")
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    }

    const persistLocalListing = (listing) => {
        const currentLocalListings = getStoredLocalListings()
        const nextLocalListings = [listing, ...currentLocalListings.filter((item) => String(item?._id) !== String(listing?._id))]
        localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(nextLocalListings))
        setListingData((prev) => [listing, ...(prev || []).filter((item) => String(item?._id) !== String(listing?._id))])
        setNewListData((prev) => [listing, ...(prev || []).filter((item) => String(item?._id) !== String(listing?._id))])
        const nextUser = userData && typeof userData === "object"
            ? { ...userData, listing: [listing, ...(((userData.listing) || []).filter((item) => String(item?._id) !== String(listing?._id)))] }
            : null
        if (nextUser) {
            setUserData(nextUser)
            localStorage.setItem("zenstay_user", JSON.stringify(nextUser))
        }
    }

    const resetListingForm = () => {
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
    }

    const getFallbackImagesForCategory = (selectedCategory) => {
        const normalizedCategory = String(selectedCategory || "").trim()
        return listingImageFallbacks[normalizedCategory] || listingImageFallbacks.villa
    }

    

     const handleAddListing = async () => {
        setAdding(true)
        try {
            const images = [backEndImage1, backEndImage2, backEndImage3].filter(Boolean)
            const totalUploadSize = images.reduce((sum, image) => sum + String(image || "").length, 0)
            if (images.length !== 3) {
                throw new Error("All three listing images are required")
            }
            if (totalUploadSize > MAX_LISTING_UPLOAD_SIZE) {
                throw new Error("Listing images are still too large. Please choose smaller images.")
            }

            const payload = {
                title,
                image1: backEndImage1,
                image2: backEndImage2,
                image3: backEndImage3,
                description,
                rent,
                city,
                landMark: landmark,
                category
            }

        let result
        try {
            result = await axios.post(serverUrl + "/api/listing/add", payload, buildAuthConfig())
        } catch (primaryError) {
            try {
                const [fallbackImage1, fallbackImage2, fallbackImage3] = getFallbackImagesForCategory(category)
                const fallbackPayload = {
                    ...payload,
                    image1: fallbackImage1,
                    image2: fallbackImage2,
                    image3: fallbackImage3
                }
                result = await axios.post(serverUrl + "/api/listing/add", fallbackPayload, buildAuthConfig())
                toast.info("Listing added with fallback images.")
            } catch (fallbackError) {
                const [fallbackImage1, fallbackImage2, fallbackImage3] = getFallbackImagesForCategory(category)
                const localListing = {
                    _id: `local-${Date.now()}`,
                    title,
                    description,
                    rent: Number(rent || 0),
                    city,
                    country: "",
                    landMark: landmark,
                    category,
                    image1: fallbackImage1,
                    image2: fallbackImage2,
                    image3: fallbackImage3,
                    host: userData?._id || "local-user",
                    ratings: 0,
                    isBooked: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
                persistLocalListing(localListing)
                setAdding(false)
                navigate("/")
                toast.success("Listing saved locally.")
                resetListingForm()
                return
            }
        }
        setAdding(false)
        console.log(result)
        await getListing()
        navigate("/")
        toast.success("AddListing Successfully")
        resetListingForm()
            
        } catch (error) {
            setAdding(false)
            console.log(error)
            toast.error(getErrorMessage(error, "Unable to add listing"))
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
            toast.error(getErrorMessage(error, "Unable to open this listing right now."))
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
        setListingsLoading(true)
        const localListings = getStoredLocalListings()
        try {
            let result = await axios.get( serverUrl + "/api/listing/get",{withCredentials:true, timeout: 6000})
            const items = Array.isArray(result.data) ? result.data : []
            if (items.length === 0) {
                const mergedEmptyItems = mergeListings(localListings)
                setListingData(mergedEmptyItems)
                setNewListData(mergedEmptyItems)
                if (!didShowFallbackToast.current) {
                    toast.info("No backend listings found yet, showing demo cards.")
                    didShowFallbackToast.current = true
                }
                setListingsLoading(false)
                return
            }
            const mergedItems = mergeListings([...(localListings || []), ...items])
            setListingData(mergedItems)
            setNewListData(mergedItems)
            didShowFallbackToast.current = false
            setListingsLoading(false)

        } catch (error) {
            console.log(error)
            const mergedFallbackItems = mergeListings(localListings)
            setListingData(mergedFallbackItems)
            setNewListData(mergedFallbackItems)
            if (!didShowFallbackToast.current) {
                toast.error(getErrorMessage(error, "Backend listings unavailable, showing demo cards."))
                didShowFallbackToast.current = true
            }
            setListingsLoading(false)
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
        listingsLoading,setListingsLoading,
        handleViewCard,
        cardDetails,setCardDetails,
        buildAuthConfig,
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
