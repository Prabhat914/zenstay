import mongoose from "mongoose";


const listingSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    host:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    guest:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
        
    },
    image1:{
        type:String,
        required:true
    },
    image2:{
        type:String,
        required:true
    },
    image3:{
        type:String,
        required:true
    },
    video:{
        type:String,
        default:""
    },
    reel:{
        type:String,
        default:""
    },
    rent:{
        type:Number,
        required:true
    },
    city:{
        type:String,
        required:true

    },
    country:{
        type:String,
        default:""
    },
    landMark:{
        type:String,
        required:true

    },
    category:{
        type:String,
        required:true

    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numberOfRatings: {
        type: Number,
        default: 0
    },
    comments:[{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        userName:{
            type:String,
            required:true
        },
        message:{
            type:String,
            required:true
        },
        createdAt:{
            type:Date,
            default:Date.now
        }
    }],
    isBooked:{
        type:Boolean,
        default:false
    }


},{timestamps:true})

const Listing = mongoose.model( "Listing" , listingSchema)

export default Listing
