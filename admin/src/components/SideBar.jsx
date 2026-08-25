import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
 
const SideBar = ({ showMobileMenu, setShowMobileMenu }) => {
 
    const {aToken, setAToken} = useContext(AdminContext)
    const {dToken, setDToken} = useContext(DoctorContext)
    const navigate = useNavigate()

    const logout = () => {
        navigate('/')
        aToken && setAToken('')
        aToken && localStorage.removeItem('aToken')
        dToken && setDToken('')
        dToken && localStorage.removeItem('dToken')
        setShowMobileMenu(false)
    }
 
  return (
    <>
      {/* Desktop Sidebar */}
      <div className='hidden md:block bg-white border-r border-gray-400'>
          {
              aToken && <ul className='text-[#515151] mt-5'>
  
              <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF]' : ''}`} to={'/admin-dashboard'}>
                  <img src={assets.home_icon} alt=''/>
                  <p className='hidden md:block'>Dashboard</p>
              </NavLink>
  
              <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF]' : ''}`} to={'/all-appointments'}>
                  <img src={assets.appointment_icon} alt=''/>
                  <p className='hidden md:block'>Appointments</p>
              </NavLink>
  
              <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF]' : ''}`} to={'/add-doctor'}>
                  <img src={assets.add_icon} alt=''/>
                  <p className='hidden md:block'>Add Doctor</p>
              </NavLink>
  
              <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF]' : ''}`} to='doctor-list'>
                  <img src={assets.people_icon} alt=''/>
                  <p className='hidden md:block'>Doctors List</p>
              </NavLink>
  
              </ul>
          }
  
  
          {
              dToken && <ul className='text-[#515151] mt-5'>
  
              <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF]' : ''}`} to={'/doctor-dashboard'}>
                  <img src={assets.home_icon} alt=''/>
                  <p className='hidden md:block'>Dashboard</p>
              </NavLink>
  
              <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF]' : ''}`} to={'/doctor-appointment'}>
                  <img src={assets.appointment_icon} alt=''/>
                  <p className='hidden md:block'>Appointments</p>
              </NavLink>
  
              <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF]' : ''}`} to={'/doctor-availability'}>
                  <img src={assets.appointment_icon} alt=''/>
                  <p className='hidden md:block'>Manage Availability</p>
              </NavLink>
  
              <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF]' : ''}`} to={'/doctor-blocked-slots'}>
                  <img src={assets.cancel_icon} alt=''/>
                  <p className='hidden md:block'>Manage Blocked Slots</p>
              </NavLink>
  
              <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF]' : ''}`} to={'/doctor-reviews'}>
                  <img src={assets.patients_icon} alt=''/>
                  <p className='hidden md:block'>Reviews</p>
              </NavLink>
  
              <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF]' : ''}`} to={'/doctor-profile'}>
                  <img src={assets.people_icon} alt=''/>
                  <p className='hidden md:block'>Profile</p>
              </NavLink>
  
              </ul>
          }
      </div>

      {/* Mobile Slide-in Drawer */}
      <div className={`fixed inset-0 z-40 transition-all duration-300 md:hidden ${showMobileMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          {/* Dark overlay */}
          <div onClick={() => setShowMobileMenu(false)} className='absolute inset-0 bg-black/40 backdrop-blur-sm'></div>
          
          {/* Drawer container */}
          <div className={`absolute left-0 top-0 bottom-0 w-64 bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 transform ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className='flex items-center justify-between p-5 border-b border-gray-200 h-[70px] flex-shrink-0'>
                  <div className='flex items-center gap-2 text-xs'>
                      <img className='w-28' src={assets.admin_logo} alt='' />
                      <p className='border px-2 py-0.5 rounded-full border-gray-500 text-gray-600 text-[10px] font-medium'>
                          {aToken ? 'Admin' : 'Doctor'}
                      </p>
                  </div>
                  <button onClick={() => setShowMobileMenu(false)} className='p-1 rounded hover:bg-gray-100 cursor-pointer' aria-label="Close menu">
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                  </button>
              </div>

              <div className='flex-1 overflow-y-auto py-4'>
                  {aToken && (
                      <ul className='text-[#515151] flex flex-col gap-1 list-none p-0 m-0'>
                          <NavLink onClick={() => setShowMobileMenu(false)} className={({isActive}) => `flex items-center gap-3 py-3 px-6 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF] text-[#5F6FFF]' : ''}`} to={'/admin-dashboard'}>
                              <img className='w-5 h-5 object-contain' src={assets.home_icon} alt=''/>
                              <p className='font-medium'>Dashboard</p>
                          </NavLink>
                          <NavLink onClick={() => setShowMobileMenu(false)} className={({isActive}) => `flex items-center gap-3 py-3 px-6 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF] text-[#5F6FFF]' : ''}`} to={'/all-appointments'}>
                              <img className='w-5 h-5 object-contain' src={assets.appointment_icon} alt=''/>
                              <p className='font-medium'>Appointments</p>
                          </NavLink>
                          <NavLink onClick={() => setShowMobileMenu(false)} className={({isActive}) => `flex items-center gap-3 py-3 px-6 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF] text-[#5F6FFF]' : ''}`} to={'/add-doctor'}>
                              <img className='w-5 h-5 object-contain' src={assets.add_icon} alt=''/>
                              <p className='font-medium'>Add Doctor</p>
                          </NavLink>
                          <NavLink onClick={() => setShowMobileMenu(false)} className={({isActive}) => `flex items-center gap-3 py-3 px-6 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF] text-[#5F6FFF]' : ''}`} to='doctor-list'>
                              <img className='w-5 h-5 object-contain' src={assets.people_icon} alt=''/>
                              <p className='font-medium'>Doctors List</p>
                          </NavLink>
                      </ul>
                  )}

                  {dToken && (
                      <ul className='text-[#515151] flex flex-col gap-1 list-none p-0 m-0'>
                          <NavLink onClick={() => setShowMobileMenu(false)} className={({isActive}) => `flex items-center gap-3 py-3 px-6 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF] text-[#5F6FFF]' : ''}`} to={'/doctor-dashboard'}>
                              <img className='w-5 h-5 object-contain' src={assets.home_icon} alt=''/>
                              <p className='font-medium'>Dashboard</p>
                          </NavLink>
                          <NavLink onClick={() => setShowMobileMenu(false)} className={({isActive}) => `flex items-center gap-3 py-3 px-6 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF] text-[#5F6FFF]' : ''}`} to={'/doctor-appointment'}>
                              <img className='w-5 h-5 object-contain' src={assets.appointment_icon} alt=''/>
                              <p className='font-medium'>Appointments</p>
                          </NavLink>
                          <NavLink onClick={() => setShowMobileMenu(false)} className={({isActive}) => `flex items-center gap-3 py-3 px-6 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF] text-[#5F6FFF]' : ''}`} to={'/doctor-availability'}>
                              <img className='w-5 h-5 object-contain' src={assets.appointment_icon} alt=''/>
                              <p className='font-medium'>Manage Availability</p>
                          </NavLink>
                          <NavLink onClick={() => setShowMobileMenu(false)} className={({isActive}) => `flex items-center gap-3 py-3 px-6 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF] text-[#5F6FFF]' : ''}`} to={'/doctor-blocked-slots'}>
                              <img className='w-5 h-5 object-contain' src={assets.cancel_icon} alt=''/>
                              <p className='font-medium'>Manage Blocked Slots</p>
                          </NavLink>
                          <NavLink onClick={() => setShowMobileMenu(false)} className={({isActive}) => `flex items-center gap-3 py-3 px-6 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF] text-[#5F6FFF]' : ''}`} to={'/doctor-reviews'}>
                              <img className='w-5 h-5 object-contain' src={assets.patients_icon} alt=''/>
                              <p className='font-medium'>Reviews</p>
                          </NavLink>
                          <NavLink onClick={() => setShowMobileMenu(false)} className={({isActive}) => `flex items-center gap-3 py-3 px-6 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#5F6FFF] text-[#5F6FFF]' : ''}`} to={'/doctor-profile'}>
                              <img className='w-5 h-5 object-contain' src={assets.people_icon} alt=''/>
                              <p className='font-medium'>Profile</p>
                          </NavLink>
                      </ul>
                  )}
              </div>

              {/* Logout Section (pinned to bottom) */}
              <div className='p-4 border-t border-gray-200 flex-shrink-0 bg-white'>
                  <button onClick={logout} className='w-full text-left flex items-center justify-start gap-3 py-3 px-6 cursor-pointer text-red-500 hover:bg-red-50/50 rounded-lg transition-colors font-medium text-sm border-none outline-none'>
                      <span>Logout</span>
                  </button>
              </div>
          </div>
      </div>
    </>
  )
}

export default SideBar