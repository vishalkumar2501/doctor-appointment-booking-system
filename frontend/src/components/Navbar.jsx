import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Navbar = () => {
    const navigate = useNavigate()
    const { token, setToken, userData } = useContext(AppContext)

    const [showMenu, setShowMenu] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)

    const logout = () => {
        setToken(false)
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <header className='sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100/80 transition-all'>
            <div className='flex items-center justify-between text-sm py-3.5 mb-2'>
                
                {/* Logo & Platform Tag */}
                <div className='flex items-center gap-3'>
                    <img 
                        onClick={() => navigate('/')} 
                        className='w-36 sm:w-44 cursor-pointer hover:opacity-95 transition-opacity' 
                        src={assets.logo} 
                        alt='DocBook' 
                    />
                </div>

                {/* Desktop Nav Links */}
                <nav className='hidden md:flex items-center gap-1 lg:gap-2 font-medium text-gray-600'>
                    <NavLink 
                        to='/' 
                        className={({ isActive }) => 
                            `px-4 py-2 rounded-full transition-all duration-200 ${
                                isActive 
                                    ? 'bg-[#5F6FFF]/10 text-[#5F6FFF] font-semibold' 
                                    : 'hover:text-[#5F6FFF] hover:bg-gray-50'
                            }`
                        }
                    >
                        HOME
                    </NavLink>

                    <NavLink 
                        to='/doctors' 
                        className={({ isActive }) => 
                            `px-4 py-2 rounded-full transition-all duration-200 ${
                                isActive 
                                    ? 'bg-[#5F6FFF]/10 text-[#5F6FFF] font-semibold' 
                                    : 'hover:text-[#5F6FFF] hover:bg-gray-50'
                            }`
                        }
                    >
                        ALL DOCTORS
                    </NavLink>

                    <NavLink 
                        to='/about' 
                        className={({ isActive }) => 
                            `px-4 py-2 rounded-full transition-all duration-200 ${
                                isActive 
                                    ? 'bg-[#5F6FFF]/10 text-[#5F6FFF] font-semibold' 
                                    : 'hover:text-[#5F6FFF] hover:bg-gray-50'
                            }`
                        }
                    >
                        ABOUT
                    </NavLink>

                    <NavLink 
                        to='/contact' 
                        className={({ isActive }) => 
                            `px-4 py-2 rounded-full transition-all duration-200 ${
                                isActive 
                                    ? 'bg-[#5F6FFF]/10 text-[#5F6FFF] font-semibold' 
                                    : 'hover:text-[#5F6FFF] hover:bg-gray-50'
                            }`
                        }
                    >
                        CONTACT
                    </NavLink>
                </nav>

                {/* Right Action / Profile */}
                <div className='flex items-center gap-3 sm:gap-4'>
                    {token && userData ? (
                        <div 
                            onClick={() => setShowProfileMenu(prev => !prev)}
                            className='flex items-center gap-2.5 cursor-pointer group relative bg-gray-50 hover:bg-gray-100/80 p-1.5 pr-3 rounded-full border border-gray-200/70 transition-all'
                        >
                            <img 
                                className='w-8 h-8 rounded-full object-cover border border-[#5F6FFF]/30' 
                                src={userData.image || 'https://raw.githubusercontent.com/avinashdm/gs-images/main/prescripto/doc1.png'} 
                                alt='Profile' 
                            />
                            <span className='hidden sm:inline-block font-semibold text-xs text-gray-700 max-w-[100px] truncate'>
                                {userData.name || 'User'}
                            </span>
                            <img className='w-2.5 opacity-60 group-hover:opacity-100 transition-opacity' src={assets.dropdown_icon} alt='' />

                            {/* Dropdown Menu */}
                            <div className={`absolute top-full right-0 mt-2 text-sm font-medium text-gray-700 z-50 transition-all duration-200
                                ${showProfileMenu ? 'block' : 'hidden'} md:hidden md:group-hover:block`}>
                                <div className='min-w-56 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col p-2 gap-1 overflow-hidden'>
                                    <div className='px-3 py-2 border-b border-gray-100 text-xs text-gray-500'>
                                        Signed in as <span className='font-semibold text-gray-800 block truncate'>{userData.email}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setShowProfileMenu(false); navigate('my-profile') }}
                                        className='flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-indigo-50 hover:text-[#5F6FFF] text-left transition-colors cursor-pointer w-full text-xs font-medium'
                                    >
                                        <span>👤</span> My Profile
                                    </button>

                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setShowProfileMenu(false); navigate('my-appointments') }}
                                        className='flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-indigo-50 hover:text-[#5F6FFF] text-left transition-colors cursor-pointer w-full text-xs font-medium'
                                    >
                                        <span>📅</span> My Appointments
                                    </button>

                                    <div className='border-t border-gray-100 my-1'></div>

                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setShowProfileMenu(false); logout() }}
                                        className='flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 text-left transition-colors cursor-pointer w-full text-xs font-medium'
                                    >
                                        <span>🚪</span> Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => navigate('/login')} 
                            className='bg-gradient-to-r from-[#5F6FFF] to-indigo-600 text-white px-6 sm:px-7 py-2.5 rounded-full font-medium text-xs sm:text-sm hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-102 active:scale-98 transition-all cursor-pointer'
                        >
                            Create account
                        </button>
                    )} 

                    {/* Mobile Hamburger Button */}
                    <button 
                        onClick={() => setShowMenu(true)} 
                        className='p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 md:hidden cursor-pointer transition-colors'
                        aria-label="Open menu"
                    >
                        <img className='w-5' src={assets.menu_icon} alt='Menu'/>
                    </button>

                    {/* Mobile Slide-in Drawer */}
                    <div className={`fixed inset-0 z-50 transition-all duration-300 md:hidden ${showMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                        {/* Dark Backdrop */}
                        <div onClick={() => setShowMenu(false)} className='absolute inset-0 bg-black/40 backdrop-blur-sm'></div>
                        
                        {/* Drawer */}
                        <div className={`absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 transform ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}>
                            <div className='flex items-center justify-between px-5 py-5 border-b border-gray-100'>
                                <img className='w-32' src={assets.logo} alt='DocBook' />
                                <button onClick={() => setShowMenu(false)} className='p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer text-gray-500'>
                                    <img className='w-6' src={assets.cross_icon} alt='Close'/>
                                </button>
                            </div>

                            <div className='flex-1 overflow-y-auto py-6 px-5'>
                                <ul className='flex flex-col gap-2 font-medium text-gray-700 text-sm'>
                                    <NavLink onClick={() => setShowMenu(false)} to='/' className={({isActive}) => `px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-[#5F6FFF]/10 text-[#5F6FFF] font-semibold' : 'hover:bg-gray-50'}`}>HOME</NavLink>
                                    <NavLink onClick={() => setShowMenu(false)} to='/doctors' className={({isActive}) => `px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-[#5F6FFF]/10 text-[#5F6FFF] font-semibold' : 'hover:bg-gray-50'}`}>ALL DOCTORS</NavLink>
                                    <NavLink onClick={() => setShowMenu(false)} to='/about' className={({isActive}) => `px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-[#5F6FFF]/10 text-[#5F6FFF] font-semibold' : 'hover:bg-gray-50'}`}>ABOUT</NavLink>
                                    <NavLink onClick={() => setShowMenu(false)} to='/contact' className={({isActive}) => `px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-[#5F6FFF]/10 text-[#5F6FFF] font-semibold' : 'hover:bg-gray-50'}`}>CONTACT</NavLink>
                                    
                                    {!token && (
                                        <>
                                            <hr className='border-gray-100 my-3' />
                                            <NavLink onClick={() => setShowMenu(false)} to='/login' className='px-4 py-3 rounded-xl bg-[#5F6FFF] text-white text-center font-semibold hover:bg-[#5F6FFF]/90 transition-all shadow-md shadow-indigo-500/20'>LOGIN / REGISTER</NavLink>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </header>
    )
}

export default Navbar
