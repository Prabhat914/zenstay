import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        default:"",
        index:true
    },
    location:{
        type:String,
        default:""
    },
    country:{
        type:String,
        default:""
    },
    mapUrl:{
        type:String,
        default:""
    },
    password:{
        type:String,
        required:true
    },
    resetPasswordOtp:{
        type:String
    },
    resetPasswordOtpExpire:{
        type:Date
    },
    listing:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Listing"
    }],
    booking:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Listing"
    }]
    


},{timestamps:true})

const User = mongoose.model("User",userSchema)

export default User

