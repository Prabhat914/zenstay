import uploadOnCloudinary from "../config/cloudinary.js";
import Listing from "../model/listing.model.js";
import User from "../model/user.model.js";



export const addListing = async (req,res) => {
    try {
        let host = req.userId;
        let {title,description,rent,city,country,landMark,category} = req.body
        if (!req.files?.image1?.[0] || !req.files?.image2?.[0] || !req.files?.image3?.[0]) {
            return res.status(400).json({ message: "All three listing images are required" })
        }
        let image1 = await uploadOnCloudinary(req.files.image1[0])
        let image2 = await uploadOnCloudinary(req.files.image2[0])
        let image3 = await uploadOnCloudinary(req.files.image3[0])

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
        if(req.files?.image1){
        image1 = await uploadOnCloudinary(req.files.image1[0])}
        if(req.files?.image2)
        {image2 = await uploadOnCloudinary(req.files.image2[0])}
        if(req.files?.image3){
        image3 = await uploadOnCloudinary(req.files.image3[0])}

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
    
