import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

const normalizeEnvValue = (value) => String(value || "")
    .replace(/^['"]|['"]$/g, "")
    .replace(/\\r/g, "")
    .replace(/\\n/g, "")
    .trim()

const uploadBufferOnCloudinary = (buffer) => new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
        if (error) {
            reject(new Error(error?.message || "Cloudinary upload failed"))
            return
        }
        resolve(result?.secure_url || "")
    })
    stream.end(buffer)
})

const uploadOnCloudinary = async (fileInput) => {
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
        if (!fileInput) {
            return null
        }
        if (Buffer.isBuffer(fileInput?.buffer)) {
            return await uploadBufferOnCloudinary(fileInput.buffer)
        }
        if (typeof fileInput === "string") {
            const uploadResult = await cloudinary.uploader.upload(fileInput)
            fs.unlinkSync(fileInput)
            return uploadResult.secure_url
        }
        if (typeof fileInput?.path === "string" && fileInput.path) {
            const uploadResult = await cloudinary.uploader.upload(fileInput.path)
            fs.unlinkSync(fileInput.path)
            return uploadResult.secure_url
        }
        throw new Error("Unsupported upload payload")
    } catch (error) {
        if (typeof fileInput === "string" && fileInput && fs.existsSync(fileInput)) {
            fs.unlinkSync(fileInput)
        } else if (typeof fileInput?.path === "string" && fileInput.path && fs.existsSync(fileInput.path)) {
            fs.unlinkSync(fileInput.path)
        }
        console.log(error)
        throw new Error(error?.message || "Cloudinary upload failed")
    }
}

export default uploadOnCloudinary
    
