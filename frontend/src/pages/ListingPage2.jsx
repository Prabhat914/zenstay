import React from 'react'
import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { listingDataContext } from '../Context/ListingContext';

const categoryItems = [
    {
        key: "villa",
        label: "Villa",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"
    },
    {
        key: "farmHouse",
        label: "Farm House",
        image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&q=80"
    },
    {
        key: "poolHouse",
        label: "Pool House",
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80"
    },
    {
        key: "rooms",
        label: "Rooms",
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80"
    },
    {
        key: "flat",
        label: "Flat",
        image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=600&q=80"
    },
    {
        key: "pg",
        label: "PG",
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80"
    },
    {
        key: "cabin",
        label: "Cabins",
        image: "https://images.unsplash.com/photo-1472224371017-08207f84aaae?auto=format&fit=crop&w=600&q=80"
    },
    {
        key: "shops",
        label: "Shops",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80"
    }
]

function ListingPage2() {

    let navigate = useNavigate()
    let {category,setCategory} = useContext(listingDataContext)
  return (
    <div className='w-[100%] h-[100vh] bg-white flex items-center justify-center relative overflow-auto '>
         <div className='w-[50px] h-[50px] bg-[red] cursor-pointer absolute top-[5%] left-[20px] rounded-[50%] flex items-center justify-center' onClick={()=>navigate("/listingpage1")}><FaArrowLeftLong className='w-[25px] h-[25px] text-[white]' /></div>
        <div className='w-[200px] h-[50px] text-[20px] bg-[#f14242] text-[white] flex items-center justify-center rounded-[30px] absolute top-[5%] right-[10px] shadow-lg'> Set Your Category </div>

        <div className='max-w-[900px] w-[100%] h-[550px] overflow-auto bg-white flex items-center justify-start flex-col gap-[40px] mt-[30px] '>
        <h1 className='text-[18px] text-[black] md:text-[30px] px-[10px] '>Which of these best describes your place?</h1>
        
        <div className='max-w-[900px] w-[100%] h-[100%] flex flex-wrap items-center justify-center gap-[15px] md:w-[70%]'>
            {categoryItems.map((item) => (
                <div
                    key={item.key}
                    className={`w-[180px] h-[150px] flex justify-end items-center flex-col cursor-pointer border-[2px] border-transparent hover:border-[#a6a5a5] text-[16px] rounded-lg overflow-hidden relative transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.16)] ${category == item.key ?"border-[#8b8b8b]" : "border-[#ececec]"}`}
                    onClick={()=>setCategory(item.key)}
                >
                    <img src={item.image} alt={item.label} className='absolute inset-0 w-full h-full object-cover' />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent' />
                    <h3 className='relative z-10 w-full py-[12px] text-center text-white font-semibold'>{item.label}</h3>
                </div>
            ))}
        </div>
        <button className='px-[50px] py-[10px] bg-[red] text-[white] text-[18px] md:px-[100px] rounded-lg absolute right-[5%] bottom-[5%]' onClick={()=>navigate("/listingpage3")} disabled={!category}>Next</button>
        </div>
      
    </div>
  )
}

export default ListingPage2
