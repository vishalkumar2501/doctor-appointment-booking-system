import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Banner = () => {
    const navigate = useNavigate()
    const { token } = useContext(AppContext)

    return (
        <section className='relative overflow-hidden bg-gradient-to-r from-indigo-600 via-[#5F6FFF] to-purple-600 rounded-3xl px-6 sm:px-10 md:px-14 lg:px-16 my-20 shadow-xl shadow-indigo-500/15'>
            
            {/* Ambient Background Circles */}
            <div className='absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none'></div>
            <div className='absolute -bottom-20 -right-20 w-80 h-80 bg-purple-900/20 rounded-full blur-3xl pointer-events-none'></div>

            <div className='flex flex-col md:flex-row items-center justify-between relative z-10'>
                {/* ------ Left Side ------ */}
                <div className='flex-1 py-10 sm:py-14 md:py-16 lg:py-20 flex flex-col items-center md:items-start text-center md:text-left justify-center gap-4'>
                    
                    <span className='inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full text-white text-xs font-semibold tracking-wide border border-white/20'>
                        ⚡ Instant Consultation & Appointments
                    </span>

                    <div className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight'>
                        <p>Book Your Appointment</p>
                        <p className='text-yellow-300 mt-2'>With 100+ Verified Doctors</p>
                    </div>

                    <p className='text-white/85 text-xs sm:text-sm max-w-md mt-1'>
                        Get priority access to top medical specialists. Create an account in under a minute and consult online or in-clinic.
                    </p>

                    <button 
                        onClick={() => {
                            navigate(token ? '/doctors' : '/login')
                            scrollTo(0, 0)
                        }} 
                        className='bg-white text-indigo-700 hover:bg-yellow-300 hover:text-gray-900 font-bold text-xs sm:text-sm px-8 py-3.5 rounded-full mt-3 hover:scale-105 active:scale-95 hover:shadow-lg transition-all duration-300 cursor-pointer shadow-md'
                    >
                        {token ? 'Browse Doctors Now' : 'Create Free Account'}
                    </button>
                </div>

                {/* ------ Right Side ------ */}
                <div className='md:w-1/2 lg:w-[380px] relative flex justify-center md:justify-end w-full max-w-xs md:max-w-none pt-4 md:pt-0 self-end'>
                    <img 
                        className='w-full max-w-[320px] md:max-w-none h-auto object-contain drop-shadow-2xl' 
                        src={assets.appointment_img} 
                        alt='Appointment Booking'
                    />
                </div>
            </div>
        </section>
    )
}

export default Banner