import uploadOnCloudinary from "../config/cloudinary.js";
import Listing from "../model/listing.model.js";
import User from "../model/user.model.js";
import { resolveListingCategory } from "../utils/listingCategory.js";

const listingImageFallbacks = {
    villa: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1200&q=80"
    ],
    farmHouse: [
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1464225226654-bc3515942121?auto=format&fit=crop&w=1200&q=80"
    ],
    poolHouse: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1580587767303-94498446272c?auto=format&fit=crop&w=1200&q=80"
    ],
    rooms: [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1616594039964-3f2b9dd2f7ab?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80"
    ],
    flat: [
        "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
    ],
    pg: [
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80"
    ],
    cabin: [
        "https://images.unsplash.com/photo-1472224371017-08207f84aaae?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1449156001437-3a144174838a?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80"
    ],
    shops: [
        "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1561715276-a2d087060f1d?auto=format&fit=crop&w=1200&q=80"
    ]
}

const listingVideoFallbacks = {
    villa: "https://res.cloudinary.com/demo/video/upload/q_auto/v1/samples/sea-turtle.mp4",
    farmHouse: "https://res.cloudinary.com/demo/video/upload/q_auto/v1/samples/elephants.mp4",
    poolHouse: "https://res.cloudinary.com/demo/video/upload/q_auto/v1/samples/sea-turtle.mp4",
    rooms: "https://res.cloudinary.com/demo/video/upload/q_auto/v1/samples/dog.mp4",
    flat: "https://res.cloudinary.com/demo/video/upload/q_auto/v1/samples/sea-turtle.mp4",
    pg: "https://res.cloudinary.com/demo/video/upload/q_auto/v1/samples/dog.mp4",
    cabin: "https://res.cloudinary.com/demo/video/upload/q_auto/v1/samples/elephants.mp4",
    shops: "https://res.cloudinary.com/demo/video/upload/q_auto/v1/samples/sea-turtle.mp4"
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

export const addListing = async (req,res) => {
    try {
        let host = req.userId;
        let {title,description,rent,city,country,landMark,category} = req.body
        if (!String(title || "").trim() || !String(description || "").trim() || !String(city || "").trim() || !String(landMark || "").trim()) {
            return res.status(400).json({ message: "Title, description, city, and landmark are required" })
        }
        if (!Number.isFinite(Number(rent)) || Number(rent) <= 0) {
            return res.status(400).json({ message: "Rent must be a valid positive number" })
        }

        // Mandatory Images Check
        const image1 = await resolveListingImage(req, "image1")
        const image2 = await resolveListingImage(req, "image2")
        const image3 = await resolveListingImage(req, "image3")

        if (!image1 || !image2 || !image3) {
            return res.status(400).json({ message: "At least 3 images are mandatory for listing" })
        }

        const resolvedCategory = resolveListingCategory({ category, image1, image2, image3 })
        if (!resolvedCategory) {
            return res.status(400).json({ message: "A supported listing category is required" })
        }

        // Video Upload or Auto-Reel Generation
        let video = await resolveListingImage(req, "video") // Uses the same helper for cloudinary
        let reel = video || ""

        if (!video) {
            // Use Cloudinary transformation to create a video from the three uploaded images
            const baseUrl = "https://res.cloudinary.com/demo/video/upload"
            reel = `${baseUrl}/w_500,h_800,c_fill,du_6/fl_layer_apply,l_fetch:${Buffer.from(image1).toString('base64')}/fl_layer_apply,l_fetch:${Buffer.from(image2).toString('base64')},so_2/fl_layer_apply,l_fetch:${Buffer.from(image3).toString('base64')},so_4/video_from_images.mp4`
        }

        let listing = await Listing.create({
            title,
            description,
            rent,
            city,
            country,
            landMark,
            category: resolvedCategory,
            image1,
            image2,
            image3,
            video,
            reel,
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
       return res.status(500).json({ message: `findListing error ${error}` })
    }
    
}
export const updateListing = async (req,res) => {
    try {
        let {id} = req.params;
        let {title,description,rent,city,country,landMark,category} = req.body
        let listing = await Listing.findById(id)
        if(!listing){
            return res.status(404).json({message:"Listing not found"})
        }
        if (String(listing.host) !== String(req.userId)) {
            return res.status(403).json({message:"You can update only your own listing"})
        }

        listing.title = String(title || listing.title).trim()
        listing.description = String(description || listing.description).trim()
        listing.rent = Number(rent || listing.rent)
        listing.city = String(city || listing.city).trim()
        listing.country = String(country ?? listing.country).trim()
        listing.landMark = String(landMark || listing.landMark).trim()
        const nextImage1 = req.body?.image1 || req.files?.image1 ? await resolveListingImage(req, "image1") : listing.image1
        const nextImage2 = req.body?.image2 || req.files?.image2 ? await resolveListingImage(req, "image2") : listing.image2
        const nextImage3 = req.body?.image3 || req.files?.image3 ? await resolveListingImage(req, "image3") : listing.image3

        listing.category = resolveListingCategory({
            category: category || listing.category,
            image1: nextImage1,
            image2: nextImage2,
            image3: nextImage3
        })

        listing.image1 = nextImage1
        listing.image2 = nextImage2
        listing.image3 = nextImage3
        
        if(req.body?.video || req.files?.video){
            listing.video = await resolveListingImage(req, "video")
            listing.reel = listing.video // Update reel if new video is uploaded
        } else if ((req.body?.image1 || req.files?.image1) && !listing.video) {
            // If images are updated but no video, we could re-generate the reel
            // Simple placeholder logic for now
            listing.reel = `https://res.cloudinary.com/demo/image/upload/w_300,h_500,c_fill,f_mp4/l_image1,fl_layer_apply/l_image2,fl_layer_apply,y_500/l_image3,fl_layer_apply,y_1000/blank.png`
        }

        if (!listing.title || !listing.description || !listing.city || !listing.landMark || !listing.category) {
            return res.status(400).json({ message: "Title, description, city, landmark, and a supported category are required" })
        }
        if (!Number.isFinite(Number(listing.rent)) || Number(listing.rent) <= 0) {
            return res.status(400).json({ message: "Rent must be a valid positive number" })
        }

        await listing.save()
        
        return res.status(201).json(listing)
       

    } catch (error) {
        return res.status(500).json({message:error?.message || `UpdateListing Error ${error}`})
    }
}

export const deleteListing = async (req,res) => {
    try {
        let {id} = req.params
        let listing = await Listing.findById(id)
        if(!listing){
            return res.status(404).json({message:"Listing not found"})
        }
        if (String(listing.host) !== String(req.userId)) {
            return res.status(403).json({message:"You can delete only your own listing"})
        }
        await listing.deleteOne()
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

export const deleteComment = async (req,res) => {
    try {
        const { id, commentId } = req.params
        const listing = await Listing.findById(id)
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" })
        }

        const comment = listing.comments.id(commentId)
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" })
        }
        if (String(comment.user) !== String(req.userId)) {
            return res.status(403).json({ message: "You can delete only your own comment" })
        }

        comment.deleteOne()
        await listing.save()
        await listing.populate("comments.user", "name")

        return res.status(200).json({
            message: "Comment deleted",
            comments: listing.comments
        })
    } catch (error) {
        return res.status(500).json({ message: `deleteComment error ${error}` })
    }
}
    
