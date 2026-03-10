import express from "express"
import isAuth from "../middleware/isAuth.js"
import upload from "../middleware/multer.js"
import { addComment, addListing, deleteComment, deleteListing, findListing, getListing, ratingListing, search, updateListing } from "../controllers/listing.controller.js"

let listingRouter = express.Router()
const listingUploadFields = upload.fields([
    {name:"image1",maxCount:1},
    {name:"image2",maxCount:1},
    {name:"image3",maxCount:1}
])

const optionalListingUpload = (req, res, next) => {
    const contentType = String(req.headers["content-type"] || "").toLowerCase()
    if (contentType.includes("multipart/form-data")) {
        return listingUploadFields(req, res, next)
    }
    next()
}


listingRouter.post("/add",isAuth,optionalListingUpload,addListing)

listingRouter.get("/get",getListing)
listingRouter.get("/findlistingbyid/:id",findListing)
listingRouter.delete("/delete/:id",isAuth,deleteListing)
listingRouter.post("/ratings/:id",isAuth,ratingListing)
listingRouter.post("/comment/:id",isAuth,addComment)
listingRouter.delete("/comment/:id/:commentId",isAuth,deleteComment)
listingRouter.get("/search",search)

listingRouter.post("/update/:id",isAuth,optionalListingUpload,updateListing)

export default listingRouter
