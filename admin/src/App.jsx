import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import SideBar from './components/SideBar';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import { DoctorContext } from './context/DoctorContext';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointment from './pages/Doctor/DoctorAppointment';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import DoctorAvailability from './pages/Doctor/DoctorAvailability';
import DoctorBlockedSlots from './pages/Doctor/DoctorBlockedSlots';
import DoctorReviews from './pages/Doctor/DoctorReviews';
import AcceptInvite from './pages/AcceptInvite';
import DoctorForgotPassword from './pages/DoctorForgotPassword';
import Footer from './components/Footer';

const App = () => {
 
  const {aToken} = useContext(AdminContext)
  const {dToken} = useContext(DoctorContext)
  const [showMobileMenu, setShowMobileMenu] = React.useState(false)
 
  if (!aToken && !dToken) {
    return (
      <div className='bg-[#F8F9FD] min-h-screen flex flex-col'>
        <ToastContainer/>
        <Navbar showMobileMenu={false} setShowMobileMenu={() => {}} />
        <Routes>
          <Route path='/accept-invite' element={<AcceptInvite />} />
          <Route path='/forgot-password' element={<DoctorForgotPassword />} />
          <Route path='*' element={<Login />} />
        </Routes>
      </div>
    )
  }

  return (
    <div className='bg-[#F8F9FD] min-h-screen flex flex-col'>
      <ToastContainer/>
      <Navbar showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} />
      <div className='flex items-stretch flex-1 w-full'>
        <SideBar showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} />

        <div className='flex-1 flex flex-col justify-between w-full overflow-x-hidden'>
          <div className='flex-1 p-4 sm:p-6'>
            <Routes>
              {/* ----- Admin Route ------ */}
              <Route path='/' element={<></>} />
              <Route path='/admin-dashboard' element={<Dashboard/>} />
              <Route path='/all-appointments' element={<AllAppointments/>} />
              <Route path='add-doctor' element={<AddDoctor/>} />
              <Route path='/doctor-list' element={<DoctorsList/>} />
              <Route path='/accept-invite' element={<AcceptInvite />} />
              <Route path='/forgot-password' element={<DoctorForgotPassword />} />

              {/* ----- Doctor Route ------ */}
              <Route path='/doctor-dashboard' element={<DoctorDashboard/>} />
              <Route path='/doctor-appointment' element={<DoctorAppointment/>} />
              <Route path='/doctor-profile' element={<DoctorProfile/>} />
              <Route path='/doctor-availability' element={<DoctorAvailability/>} />
              <Route path='/doctor-blocked-slots' element={<DoctorBlockedSlots/>} />
              <Route path='/doctor-reviews' element={<DoctorReviews/>} />
            </Routes>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default App