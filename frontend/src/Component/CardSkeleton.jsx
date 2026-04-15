import React from 'react';

const CardSkeleton = () => {
  return (
    <div className='w-full h-[420px] rounded-[28px] border border-[#e6ecec] bg-white shadow-[0_16px_36px_rgba(15,23,42,0.06)] overflow-hidden animate-pulse'>
      {/* Image placeholder */}
      <div className='w-full h-[240px] bg-gray-200'></div>
      <div className='p-[16px] flex flex-col gap-[8px]'>
        {/* Title placeholder */}
        <div className='h-[24px] w-[80%] bg-gray-200 rounded-md'></div>
        {/* Location placeholder */}
        <div className='h-[18px] w-[60%] bg-gray-200 rounded-md'></div>
        {/* Rent placeholder */}
        <div className='h-[20px] w-[40%] bg-gray-200 rounded-md mt-[4px]'></div>
      </div>
    </div>
  );
};

export default CardSkeleton;