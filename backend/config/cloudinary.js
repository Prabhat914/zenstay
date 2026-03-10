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

const fileToDataUrl = (fileInput) => {
    const buffer = Buffer.isBuffer(fileInput?.buffer)
        ? fileInput.buffer
        : typeof fileInput === "string" && fs.existsSync(fileInput)
            ? fs.readFileSync(fileInput)
            : typeof fileInput?.path === "string" && fileInput.path && fs.existsSync(fileInput.path)
                ? fs.readFileSync(fileInput.path)
                : null

    if (!buffer) {
        throw new Error("Unsupported upload payload")
    }

    const mimeType = String(fileInput?.mimetype || "image/jpeg").trim() || "image/jpeg"
    return `data:${mimeType};base64,${buffer.toString("base64")}`
}

const uploadOnCloudinary = async (fileInput) => {
    const cloudName = normalizeEnvValue(process.env.CLOUDINARY_CLOUD_NAME)
    const apiKey = normalizeEnvValue(process.env.CLOUDINARY_API_KEY)
    const apiSecret = normalizeEnvValue(process.env.CLOUDINARY_API_SECRET)

    if (!fileInput) {
        return null
    }

    const cleanupLocalFile = () => {
        if (typeof fileInput === "string" && fileInput && fs.existsSync(fileInput)) {
            fs.unlinkSync(fileInput)
        } else if (typeof fileInput?.path === "string" && fileInput.path && fs.existsSync(fileInput.path)) {
            fs.unlinkSync(fileInput.path)
        }
    }

    try {
        if (!cloudName || !apiKey || !apiSecret) {
            return fileToDataUrl(fileInput)
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret
        })

        if (Buffer.isBuffer(fileInput?.buffer)) {
            return await uploadBufferOnCloudinary(fileInput.buffer)
        }
        if (typeof fileInput === "string") {
            const uploadResult = await cloudinary.uploader.upload(fileInput)
            cleanupLocalFile()
            return uploadResult.secure_url
        }
        if (typeof fileInput?.path === "string" && fileInput.path) {
            const uploadResult = await cloudinary.uploader.upload(fileInput.path)
            cleanupLocalFile()
            return uploadResult.secure_url
        }
        return fileToDataUrl(fileInput)
    } catch (error) {
        console.log(error)
        const fallbackImage = fileToDataUrl(fileInput)
        cleanupLocalFile()
        return fallbackImage
    }
}

export default uploadOnCloudinary
    
