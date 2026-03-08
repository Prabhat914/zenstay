import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

const normalizeEnvValue = (value) => String(value || "")
    .replace(/^['"]|['"]$/g, "")
    .replace(/\\r/g, "")
    .replace(/\\n/g, "")
    .trim()

const uploadOnCloudinary = async (filepath) => {
    const cloudName = normalizeEnvValue(process.env.CLOUDINARY_CLOUD_NAME)
    const apiKey = normalizeEnvValue(process.env.CLOUDINARY_API_KEY)
    const apiSecret = normalizeEnvValue(process.env.CLOUDINARY_API_SECRET)

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error("Cloudinary is not configured")
    }

    cloudinary.config({ 
        cloud_name: cloudName, 
        api_key: apiKey, 
        api_secret: apiSecret
    });
    try {
        if(!filepath){
            return null}
        const uploadResult = await cloudinary.uploader
        .upload(filepath)
        fs.unlinkSync(filepath)
        return uploadResult.secure_url


        
    } catch (error) {
        fs.unlinkSync(filepath)
        console.log(error)
        throw new Error(error?.message || "Cloudinary upload failed")
    }
}

export default uploadOnCloudinary
    
