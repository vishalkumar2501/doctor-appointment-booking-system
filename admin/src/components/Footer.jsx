import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'

const Footer = () => {
    const navigate = useNavigate()
    const { aToken } = useContext(AdminContext)
    const { dToken } = useContext(DoctorContext)

    const handleNavigation = (path) => {
        navigate(path)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className='bg-white border-t border-gray-300 mt-12 px-6 sm:px-10 py-10 w-full text-gray-600 text-sm'>
            <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1.5fr] gap-8 mb-8'>
                
                {/* ------ Column 1: Branding ------ */}
                <div className='flex flex-col items-start gap-3'>
                    <div className='flex items-center gap-2'>
                        <img className='w-32 cursor-pointer' src={assets.admin_logo} alt='DocBook' onClick={() => handleNavigation('/')} />
                        <span className='text-[11px] bg-[#5F6FFF]/10 text-[#5F6FFF] px-2 py-0.5 rounded-full font-medium'>
                            {aToken ? 'Admin Portal' : dToken ? 'Doctor Portal' : 'Portal'}
                        </span>
                    </div>
                    <p className='text-xs text-gray-500 leading-5 mt-1 max-w-sm'>
                        DocBook Administration and Provider management system. Seamlessly coordinate consultations, update profile details, manage slot availability, block specific hours, and verify reviews.
                    </p>
                </div>

                {/* ------ Column 2: Dashboard Navigation ------ */}
                <div>
                    <p className='text-gray-900 font-semibold mb-3 tracking-wider uppercase text-[12px]'>Dashboard Links</p>
                    <ul className='flex flex-col gap-2.5 text-xs font-medium list-none p-0 m-0'>
                        {aToken && (
                            <>
                                <li onClick={() => handleNavigation('/admin-dashboard')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors w-fit'>Dashboard</li>
                                <li onClick={() => handleNavigation('/all-appointments')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors w-fit'>All Appointments</li>
                                <li onClick={() => handleNavigation('/add-doctor')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors w-fit'>Add Doctor</li>
                                <li onClick={() => handleNavigation('/doctor-list')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors w-fit'>Doctors List</li>
                            </>
                        )}
                        {dToken && (
                            <>
                                <li onClick={() => handleNavigation('/doctor-dashboard')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors w-fit'>Dashboard</li>
                                <li onClick={() => handleNavigation('/doctor-appointment')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors w-fit'>Appointments</li>
                                <li onClick={() => handleNavigation('/doctor-availability')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors w-fit'>Manage Availability</li>
                                <li onClick={() => handleNavigation('/doctor-blocked-slots')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors w-fit'>Manage Blocked Slots</li>
                                <li onClick={() => handleNavigation('/doctor-reviews')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors w-fit'>Reviews</li>
                                <li onClick={() => handleNavigation('/doctor-profile')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors w-fit'>Profile</li>
                            </>
                        )}
                    </ul>
                </div>

                {/* ------ Column 3: Contact ------ */}
                <div className='flex flex-col gap-3'>
                    <p className='text-gray-900 font-semibold tracking-wider uppercase text-[12px]'>Contact</p>
                    <div className='flex flex-col gap-2.5 text-xs text-gray-500 font-medium'>
                        <div className='flex items-center gap-2'>
                            <svg className="w-3.5 h-3.5 text-[#5F6FFF] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            <span>+1 (212) 456-7890</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <svg className="w-3.5 h-3.5 text-[#5F6FFF] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                            <span>support@docbook.com</span>
                        </div>
                        <div className='flex items-start gap-2 leading-4'>
                            <svg className="w-4 h-4 text-[#5F6FFF] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 0 1 6 0z"></path>
                            </svg>
                            <span>123 Healthcare Boulevard,<br />NY 10001</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* ------ Copyright Section ------ */}
            <div className='max-w-7xl mx-auto border-t border-gray-200 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500'>
                <p>© {new Date().getFullYear()} DocBook Provider Portal. All Rights Reserved.</p>
                <div className='flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full font-semibold text-[#5F6FFF] text-[11px]'>
                    <span>🚀 Made by Vishal</span>
                </div>
            </div>
        </div>
    )
}

export default Footer
