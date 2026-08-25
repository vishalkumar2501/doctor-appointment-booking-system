import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Header = () => {
  return (
    <div className='relative overflow-hidden bg-gradient-to-r from-[#4E5EF7] via-[#5F6FFF] to-[#7B8BFF] rounded-3xl px-6 sm:px-10 md:px-14 lg:px-16 my-4 shadow-xl shadow-indigo-500/15'>
        
        {/* Background subtle glowing circles */}
        <div className='absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none'></div>
        <div className='absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none'></div>

        <div className='flex flex-col md:flex-row flex-wrap items-center justify-between relative z-10'>
            {/* ------ Left Side ------ */}
            <div className='md:w-1/2 flex flex-col items-center md:items-start justify-center gap-5 py-12 sm:py-16 md:py-20 text-center md:text-left'>
                
                {/* Top Badge */}
                <div className='inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-white text-xs font-semibold tracking-wide shadow-xs'>
                    <span className='w-2 h-2 rounded-full bg-emerald-400 animate-ping'></span>
                    <span>24/7 Verified Healthcare Booking</span>
                </div>

                <h1 className='text-3xl sm:text-4xl lg:text-5xl text-white font-extrabold leading-[1.15] tracking-tight'>
                    Book Appointments <br/>
                    <span className='text-yellow-300'>With Trusted Doctors</span>
                </h1>
     
                <div className='flex flex-col sm:flex-row items-center gap-3.5 text-white/90 text-sm font-light'>
                    <img className='w-28 drop-shadow-sm' src={assets.group_profiles} alt='Patient Profiles'/>
                    <p className='text-xs sm:text-sm leading-relaxed'>
                        Browse through top-rated medical specialists, <br className='hidden sm:block'/>
                        check instant availability, and book appointments seamlessly.
                    </p>
                </div>
     
                <div className='flex flex-wrap items-center gap-4 pt-2'>
                    <Link 
                        to='/doctors' 
                        className='flex items-center gap-3 bg-white px-8 py-3.5 rounded-full text-indigo-700 font-bold text-sm hover:bg-yellow-300 hover:text-gray-900 hover:shadow-lg hover:shadow-black/10 hover:scale-105 active:scale-95 transition-all duration-300'
                    >
                        Book Appointment 
                        <img className='w-3.5 transition-transform group-hover:translate-x-1' src={assets.arrow_icon} alt=''/>
                    </Link>

                    <a 
                        href='#speciality' 
                        className='hidden sm:inline-flex items-center gap-1.5 text-white/90 hover:text-white text-xs font-semibold px-4 py-3 rounded-full hover:bg-white/10 transition-colors'
                    >
                        Explore Specialities ↓
                    </a>
                </div>
            </div>

            {/* ------ Right Side ------ */}
            <div className='md:w-1/2 relative flex justify-end items-end self-end pt-4 md:pt-0'>
                <img 
                    className='w-full max-w-md md:max-w-none h-auto object-contain drop-shadow-2xl' 
                    src={assets.header_img} 
                    alt='Doctors Team'
                />
            </div>
        </div>
    </div>
  )
}

export default Header