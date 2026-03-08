import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

const normalizeEnvValue = (value) => String(value || "")
    .replace(/^['"]|['"]$/g, "")
    .replace(/\\r/g, "")
    .replace(/\\n/g, "")
    .trim()

const uploadOnCloudinary = async (filepath) => {
    cloudinary.config({ 
        cloud_name: normalizeEnvValue(process.env.CLOUDINARY_CLOUD_NAME), 
        api_key: normalizeEnvValue(process.env.CLOUDINARY_API_KEY), 
        api_secret: normalizeEnvValue(process.env.CLOUDINARY_API_SECRET)
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
    }
}

export default uploadOnCloudinary
    
