import uploadOnCloudinary from "../config/cloudinary.js";
import Listing from "../model/listing.model.js";
import User from "../model/user.model.js";

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

const resolveListingImage = async (req, fieldName) => {
    const bodyImage = String(req.body?.[fieldName] || "").trim()
    if (bodyImage) {
        return bodyImage
    }
    const file = req.files?.[fieldName]?.[0]
    if (file) {
        return uploadOnCloudinary(file)
    }
    return null
}

const getFallbackListingImages = (category) => {
    const normalizedCategory = String(category || "").trim()
    return listingImageFallbacks[normalizedCategory] || listingImageFallbacks.villa
}


export const addListing = async (req,res) => {
    try {
        let host = req.userId;
        let {title,description,rent,city,country,landMark,category} = req.body
        let image1 = await resolveListingImage(req, "image1")
        let image2 = await resolveListingImage(req, "image2")
        let image3 = await resolveListingImage(req, "image3")
        const [fallbackImage1, fallbackImage2, fallbackImage3] = getFallbackListingImages(category)
        image1 = image1 || fallbackImage1
        image2 = image2 || fallbackImage2
        image3 = image3 || fallbackImage3

        let listing = await Listing.create({
            title,
            description,
            rent,
            city,
            country,
            landMark,
            category,
            image1,
            image2,
            image3,
            host
        })
        let user = await User.findByIdAndUpdate(host,{$addToSet:{listing:listing._id}},{new:true})

        if(!user){
          return  res.status(404).json({message:"User not found for listing owner"})
        }
        return res.status(201).json(listing)
       

    } catch (error) {
        console.log("addListing error", error)
        return res.status(500).json({message:error?.message || `AddListing error ${error}`})
    }
}

export const getListing= async (req,res) => {
    try {
        let listing = await Listing.find().sort({createdAt:-1})
        return res.status(200).json(listing)
    } catch (error) {
        return res.status(500).json({message:`getListing error ${error}`})
    }
    
}

export const findListing= async (req,res) => {
    try {
        let {id}= req.params
        let listing = await Listing.findById(id).populate("comments.user","name")
        if(!listing){
            return  res.status(404).json({message:"listing not found"})
        }
        return res.status(200).json(listing)
    } catch (error) {
       return res.status(500).json(`findListing error ${error}`)
    }
    
}
export const updateListing = async (req,res) => {
    try {
        let image1;
        let image2;
        let image3;
        let {id} = req.params;
        let {title,description,rent,city,country,landMark,category} = req.body
        if(req.body?.image1 || req.files?.image1){
        image1 = await resolveListingImage(req, "image1")}
        if(req.body?.image2 || req.files?.image2)
        {image2 = await resolveListingImage(req, "image2")}
        if(req.body?.image3 || req.files?.image3){
        image3 = await resolveListingImage(req, "image3")}

        let listing = await Listing.findByIdAndUpdate(id,{
            title,
            description,
            rent,
            city,
            country,
            landMark,
            category,
            image1,
            image2,
            image3,
            
        },{new:true})
        
        return res.status(201).json(listing)
       

    } catch (error) {
        return res.status(500).json({message:error?.message || `UpdateListing Error ${error}`})
    }
}

export const deleteListing = async (req,res) => {
    try {
        let {id} = req.params
        let listing = await Listing.findByIdAndDelete(id)
        let user = await User.findByIdAndUpdate(listing.host,{
            $pull:{listing:listing._id}
        },{new:true})
        if(!user){
            return res.status(404).json({message:"user is not found"})
        }
        return res.status(201).json({message:"Listing deleted"})
    } catch (error) {
        return res.status(500).json({message:`DeleteListing Error ${error}`})
    }
    
}

export const ratingListing = async (req, res) => {
    try {
        const { id } = req.params;
        const { ratings } = req.body;

       

        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        listing.ratings = Number(ratings);
        await listing.save();

        return res.status(200).json({ ratings: listing.ratings });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Rating error" });
    }
};

export const search = async (req,res) => {
    try {
        const { query } = req.query;
    
        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }
    
        const listing = await Listing.find({
            $or: [
                { landMark: { $regex: query, $options: "i" } },
                { city: { $regex: query, $options: "i" } },
                { country: { $regex: query, $options: "i" } },
                { title: { $regex: query, $options: "i" } },
            ],
        });
    
       return res.status(200).json(listing);
    } catch (error) {
        console.error("Search error:", error);
      return  res.status(500).json({ message: "Internal server error" });
    }
    }

export const addComment = async (req,res) => {
    try {
        const { id } = req.params
        const message = String(req.body?.message || "").trim()

        if (!message) {
            return res.status(400).json({ message: "Comment message is required" })
        }

        const listing = await Listing.findById(id)
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" })
        }

        const user = await User.findById(req.userId).select("name")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        listing.comments.push({
            user: user._id,
            userName: user.name,
            message
        })

        await listing.save()
        await listing.populate("comments.user", "name")

        return res.status(201).json({
            message: "Comment added",
            comments: listing.comments
        })
    } catch (error) {
        return res.status(500).json({ message: `addComment error ${error}` })
    }
}
    
