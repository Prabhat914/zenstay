import React, { useContext, useState } from 'react'
import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { listingDataContext } from '../Context/ListingContext';
import { toast } from 'react-toastify';

const MAX_IMAGE_DIMENSION = 960
const INITIAL_JPEG_QUALITY = 0.62
const MIN_JPEG_QUALITY = 0.32
const TARGET_IMAGE_SIZE = 320 * 1024

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error("Unable to read image"))
    reader.readAsDataURL(file)
})

const loadImage = (src) => new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Unable to process image"))
    image.src = src
})

const canvasToBlob = (canvas, type, quality) => new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
        if (!blob) {
            reject(new Error("Unable to compress image"))
            return
        }
        resolve(blob)
    }, type, quality)
})

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error("Unable to encode image"))
    reader.readAsDataURL(blob)
})

const prepareImageFile = async (file) => {
    if (!file) {
        return null
    }

    const source = await readFileAsDataUrl(file)
    const image = await loadImage(source)
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))

    const context = canvas.getContext("2d")
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    let quality = INITIAL_JPEG_QUALITY
    let blob = await canvasToBlob(canvas, "image/jpeg", quality)
    while (blob.size > TARGET_IMAGE_SIZE && quality > MIN_JPEG_QUALITY) {
        quality = Math.max(MIN_JPEG_QUALITY, quality - 0.08)
        blob = await canvasToBlob(canvas, "image/jpeg", quality)
    }

    return await blobToDataUrl(blob)
}

function ListingPage1() {
   let navigate = useNavigate()
   let {title,setTitle,
    description,setDescription,
    frontEndImage1,setFrontEndImage1,
    frontEndImage2,setFrontEndImage2,
    frontEndImage3,setFrontEndImage3,
    backEndImage1,setBackEndImage1,
    backEndImage2,setBackEndImage2,
    backEndImage3,setBackEndImage3,
    rent,setRent,
    city,setCity,
    landmark,setLandmark,
    category,setCategory} = useContext(listingDataContext)
    

    const handleImageChange = async (file, setBackEndImage, setFrontEndImage, inputElement) => {
        try {
            const nextFile = await prepareImageFile(file)
            if (!nextFile) {
                return
            }
            setBackEndImage(nextFile)
            setFrontEndImage(nextFile)
        } catch (error) {
            if (inputElement) {
                inputElement.value = ""
            }
            toast.error(error?.message || "Unable to prepare image")
        }
    }

    const handleImage1 = async (e)=>{
        let file = e.target.files[0]
        await handleImageChange(file, setBackEndImage1, setFrontEndImage1, e.target)
    }

    const handleImage2 = async (e)=>{
        let file = e.target.files[0]
        await handleImageChange(file, setBackEndImage2, setFrontEndImage2, e.target)
    }

    const handleImage3 = async (e)=>{
        let file = e.target.files[0]
        await handleImageChange(file, setBackEndImage3, setFrontEndImage3, e.target)
    }
  return (
    <div className='w-[100%] h-[100vh] bg-white flex items-center justify-center relative overflow-auto'>

        <form action="" className='max-w-[900px] w-[90%] h-[550px] flex items-center justify-start flex-col md:items-start gap-[10px] overflow-auto mt-[50px]' onSubmit={(e)=>{e.preventDefault()
            navigate("/listingpage2")}
        }>
            <div className='w-[50px] h-[50px] bg-[red] cursor-pointer absolute top-[5%] left-[20px] rounded-[50%] flex items-center justify-center' onClick={()=>navigate("/")}><FaArrowLeftLong className='w-[25px] h-[25px] text-[white]' /></div>
            <div className='w-[200px] h-[50px] text-[20px] bg-[#f14242] text-[white] flex items-center justify-center rounded-[30px] absolute top-[5%] right-[10px] shadow-lg'>
                SetUp Your Home
            </div>
            <div className='w-[90%] flex items-start justify-start flex-col gap-[10px]'>
              <label htmlFor="title" className='text-[20px]'>Title</label>
              <input type="text" id='title' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px]' required onChange={(e)=>setTitle(e.target.value)} value={title} placeholder='_bhk house or best title '/>
            </div> 

            <div className='w-[90%] flex items-start justify-start flex-col gap-[10px]'>
              <label htmlFor="des" className='text-[20px]'>Description</label>
              <textarea name="" id="des" className='w-[90%] h-[80px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px]' required onChange={(e)=>setDescription(e.target.value)} value={description} ></textarea>
            </div> 

            <div className='w-[90%] flex items-start justify-center flex-col gap-[10px]'>
              <label htmlFor="img1" className='text-[20px]'>Image1</label>
              <div className='flex items-center justify-start  w-[90%] h-[40px] border-[#555656] border-2 rounded-[10px] '><input type="file" id='img1' className='w-[100%] text-[15px] px-[10px] ' required onChange={handleImage1}/>
              </div>
            </div> 

            <div className='w-[90%] flex items-start justify-center flex-col gap-[10px]'>
              <label htmlFor="img2" className='text-[20px]'>Image2</label>
              <div className='flex items-center justify-start  w-[90%] h-[40px] border-[#555656] border-2 rounded-[10px]'><input type="file" id='img2' className='w-[100%] text-[15px] px-[10px] ' required onChange={handleImage2} />
              </div>
            </div> 

            <div className='w-[90%] flex items-start justify-center flex-col gap-[10px]'>
              <label htmlFor="img3" className='text-[20px]'>Image3</label>
              <div className='flex items-center justify-start  w-[90%] h-[40px] border-[#555656] border-2 rounded-[10px]'><input type="file" id='img3' className='w-[100%] text-[15px] px-[10px] ' required  onChange={handleImage3}/>
              </div>
            </div> 

            <div className='w-[90%] flex items-start justify-start flex-col gap-[10px]'>
              <label htmlFor="rent" className='text-[20px]'>Rent</label>
              <input type="number" id='rent' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px]' required onChange={(e)=>setRent(e.target.value)} value={rent} placeholder='Rs.______/day'/>
            </div> 

            <div className='w-[90%] flex items-start justify-start flex-col gap-[10px]'>
              <label htmlFor="city" className='text-[20px]'>City</label>
              <input type="text" id='city' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px]' required onChange={(e)=>setCity(e.target.value)} value={city} placeholder='city,country'/>
            </div> 

            <div className='w-[90%] flex items-start justify-start flex-col gap-[10px]'>
              <label htmlFor="landmark" className='text-[20px]'>Landmark</label>
              <input type="text" id='landmark' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px]' required onChange={(e)=>setLandmark(e.target.value)} value={landmark}/>

            </div> 

            <button className='px-[50px] py-[10px] bg-[red] text-[white] text-[18px] md:px-[100px] rounded-lg '>Next</button>





        </form>
      

      
    </div>
  )
}

export default ListingPage1
