import React from 'react'
import { Link } from 'react-router-dom'

function SiteFooter() {
  const links = [
    { to: "/about-us", label: "About Us" },
    { to: "/contact-us", label: "Contact Us" },
    { to: "/privacy-policy", label: "Privacy Policy" },
    { to: "/terms-and-conditions", label: "Terms & Conditions" },
    { to: "/refund-policy", label: "Refund Policy" }
  ]

  return (
    <footer className='w-[100%] mt-[46px] px-[16px] pb-[26px] md:px-[28px]'>
      <div className='max-w-[1240px] mx-auto rounded-[30px] border border-[#dfe8e8] bg-[linear-gradient(135deg,#ffffff_0%,#eff8f8_100%)] px-[20px] py-[24px] md:px-[30px] md:py-[28px]'>
        <div className='flex flex-col gap-[16px] md:flex-row md:items-center md:justify-between'>
          <div>
            <div className='text-[22px] font-semibold text-[#183335]'>Zenstay</div>
            <div className='text-[14px] text-[#65797b] mt-[6px]'>Simple stays, cleaner browsing, and booking flows that feel lighter.</div>
          </div>
          <div className='flex flex-wrap items-center gap-[16px] text-[14px] text-[#334749] md:text-[16px]'>
            {links.map((item) => (
              <Link key={item.to} to={item.to} className='hover:text-[var(--zenstay-accent)] transition-colors'>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
