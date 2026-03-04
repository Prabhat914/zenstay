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
    <footer className='w-[100%] border-t border-[#ddd] mt-[40px] py-[20px] px-[20px] md:px-[40px]'>
      <div className='w-[100%] flex flex-wrap items-center justify-center gap-[16px] text-[14px] text-[#333] md:text-[16px]'>
        {links.map((item) => (
          <Link key={item.to} to={item.to} className='hover:text-[red]'>
            {item.label}
          </Link>
        ))}
      </div>
    </footer>
  )
}

export default SiteFooter
