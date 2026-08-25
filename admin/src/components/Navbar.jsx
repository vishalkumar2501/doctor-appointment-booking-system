import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'

const Navbar = ({ showMobileMenu, setShowMobileMenu }) => {
 
    const {aToken, setAToken, loginState} = useContext(AdminContext)
    const {dToken, setDToken} = useContext(DoctorContext)
 
    const navigate = useNavigate()
    const location = useLocation()
 
    const logout =() => {
        navigate('/')
        aToken && setAToken('')
        aToken && localStorage.removeItem('aToken')
        dToken && setDToken('')
        dToken && localStorage.removeItem('dToken')
    }

    const isLoggedIn = !!(aToken || dToken)
    const displayRole = aToken 
        ? 'Admin' 
        : dToken 
            ? 'Doctor' 
            : (location.pathname === '/forgot-password' || location.pathname === '/accept-invite') 
                ? 'Doctor' 
                : (loginState || 'Admin')
 
  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b border-gray-400 bg-white'>
        <div className='flex items-center gap-2 text-xs'>
            <img className='w-36 sm:w-60 cursor-pointer' src={assets.admin_logo} alt='' onClick={() => navigate('/')} />
            <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600 font-medium'>
                {displayRole}
            </p>
        </div>
 
        {/* Hamburger Menu (Mobile Only) */}
        {isLoggedIn && (
            <button onClick={() => setShowMobileMenu(prev => !prev)} className='block md:hidden p-2 rounded hover:bg-gray-100 cursor-pointer' aria-label="Toggle navigation">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            </button>
        )}
 
        {/* Logout (Desktop Only) */}
        {isLoggedIn && (
            <button onClick={logout} className='hidden md:block bg-[#5F6FFF] text-white text-sm px-10 py-2 rounded-full cursor-pointer'>Logout</button>
        )}
    </div>
  )
}

export default Navbar