import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Footer = () => {
  const navigate = useNavigate()
  const { token } = useContext(AppContext)

  const handleNavigation = (path, state = null) => {
    navigate(path, { state })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className='mt-24 border-t border-gray-100 bg-gradient-to-b from-white via-indigo-50/20 to-slate-50/50 rounded-t-3xl pt-16 pb-8 text-gray-600'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2.5fr_1fr_1fr_1.8fr] gap-10 lg:gap-12 mb-14 text-sm'>
          
          {/* Brand Column */}
          <div className='flex flex-col items-start gap-4'>
            <div className='flex items-center gap-2.5'>
              <img 
                onClick={() => handleNavigation('/')} 
                className='w-40 cursor-pointer hover:opacity-90 transition-opacity' 
                src={assets.logo} 
                alt='DocBook' 
              />
              <span className='bg-[#5F6FFF]/10 text-[#5F6FFF] text-[11px] font-semibold px-2.5 py-0.5 rounded-full'>
                Verified Care
              </span>
            </div>
            <p className='leading-relaxed text-gray-500 text-[13.5px] max-w-sm mt-1'>
              DocBook is a premium healthcare consultation platform connecting patients with top medical specialists. Browse real-time slot availability, book verified doctors instantly, and manage your family's health securely.
            </p>
            
            {/* Trust badge */}
            <div className='flex items-center gap-3 pt-2 text-xs font-medium text-gray-500'>
              <div className='flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200/60'>
                <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse'></span>
                <span>24/7 Verified Booking</span>
              </div>
              <div className='flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200/60'>
                <span>🔒 100% Secure HIPAA Compliant</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <p className='text-gray-900 font-bold mb-4 tracking-wider uppercase text-xs'>Quick Links</p>
            <ul className='flex flex-col gap-2.5 font-medium'>
              <li onClick={() => handleNavigation('/')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors w-fit list-none'>Home</li>
              <li onClick={() => handleNavigation('/doctors')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors w-fit list-none'>All Doctors</li>
              <li onClick={() => handleNavigation('/about')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors w-fit list-none'>About Us</li>
              <li onClick={() => handleNavigation('/contact')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors w-fit list-none'>Contact & Support</li>
            </ul>
          </div>

          {/* Patient Portal */}
          <div>
            <p className='text-gray-900 font-bold mb-4 tracking-wider uppercase text-xs'>Patient Portal</p>
            <ul className='flex flex-col gap-2.5 font-medium'>
              {token ? (
                <>
                  <li onClick={() => handleNavigation('/my-profile')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors w-fit list-none flex items-center gap-1.5'>
                    <span>My Profile</span>
                  </li>
                  <li onClick={() => handleNavigation('/my-appointments')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors w-fit list-none flex items-center gap-1.5'>
                    <span>My Appointments</span>
                    <span className='text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded'>Active</span>
                  </li>
                </>
              ) : (
                <>
                  <li onClick={() => handleNavigation('/login', { mode: 'Login' })} className='hover:text-[#5F6FFF] cursor-pointer transition-colors w-fit list-none'>Sign In</li>
                  <li onClick={() => handleNavigation('/login', { mode: 'Sign Up' })} className='hover:text-[#5F6FFF] cursor-pointer transition-colors w-fit list-none'>Create Free Account</li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Section */}
          <div className='flex flex-col gap-3.5'>
            <p className='text-gray-900 font-bold tracking-wider uppercase text-xs'>Get In Touch</p>
            <div className='flex flex-col gap-3 text-gray-600 font-medium text-xs'>
              <div className='flex items-center gap-2.5 p-2 rounded-lg hover:bg-white hover:shadow-xs transition-all'>
                <div className='w-8 h-8 rounded-full bg-[#5F6FFF]/10 flex items-center justify-center text-[#5F6FFF] flex-shrink-0'>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className='text-[10px] text-gray-400 uppercase font-semibold'>Direct Call</p>
                  <a href="tel:+12124567890" className="hover:text-[#5F6FFF] transition-colors text-[13px] font-semibold text-gray-800">+1 (212) 456-7890</a>
                </div>
              </div>

              <div className='flex items-center gap-2.5 p-2 rounded-lg hover:bg-white hover:shadow-xs transition-all'>
                <div className='w-8 h-8 rounded-full bg-[#5F6FFF]/10 flex items-center justify-center text-[#5F6FFF] flex-shrink-0'>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className='text-[10px] text-gray-400 uppercase font-semibold'>Email Support</p>
                  <a href="mailto:support@docbook.com" className="hover:text-[#5F6FFF] transition-colors text-[13px] text-gray-800">support@docbook.com</a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Highlighted Author & Developer Banner */}
        <div className='my-8 py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-[#5F6FFF] to-purple-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md shadow-indigo-500/20'>
          <div className='flex items-center gap-3 text-center sm:text-left'>
            <div className='w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-lg'>
              🩺
            </div>
            <div>
              <p className='font-bold text-sm tracking-wide'>DocBook Healthcare Management Platform</p>
              <p className='text-xs text-white/80'>Designed with precision for seamless patient and doctor experiences.</p>
            </div>
          </div>

          <div className='flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-xs hover:bg-white/25 transition-all'>
            <span className='text-xs font-medium text-white/90'>Crafted with ❤️ by</span>
            <span className='font-bold text-sm text-yellow-300 tracking-wide'>Vishal</span>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className='border-t border-gray-200/80 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500'>
          <p>© {new Date().getFullYear()} DocBook Healthcare. All Rights Reserved.</p>

          <div className='flex items-center gap-6 font-medium'>
            <span onClick={() => handleNavigation('/about')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors'>Privacy Policy</span>
            <span onClick={() => handleNavigation('/contact')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors'>Terms of Service</span>
            <span onClick={() => handleNavigation('/')} className='hover:text-[#5F6FFF] cursor-pointer transition-colors'>System Status</span>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer