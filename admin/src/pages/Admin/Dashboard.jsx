import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const Dashboard = () => {

  const {aToken, cancelAppointment, dashData, getDashData} = useContext(AdminContext)

  const {slotDateFormat} = useContext(AppContext)

  useEffect(() => {
    if(aToken){
      getDashData()
    }
  }, [aToken])

  return dashData && (
    <div className='max-w-4xl'>
        <div className='flex flex-col sm:flex-row flex-wrap gap-3'>

          <div className='flex items-center gap-2 bg-white p-4 w-full sm:w-auto sm:min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
            <img className='w-14' src={assets.doctor_icon} alt=''/>
            <div>
              <p className='text-xl font-semibold text-gray-600'>{dashData.doctors}</p>
              <p className='text-gray-400'>Doctors</p>
            </div>
          </div>

          <div className='flex items-center gap-2 bg-white p-4 w-full sm:w-auto sm:min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
            <img className='w-14' src={assets.appointments_icon} alt=''/>
            <div>
              <p className='text-xl font-semibold text-gray-600'>{dashData.appointments}</p>
              <p className='text-gray-400'>Appointments</p>
            </div>
          </div>

          <div className='flex items-center gap-2 bg-white p-4 w-full sm:w-auto sm:min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
            <img className='w-14' src={assets.patients_icon} alt=''/>
            <div>
              <p className='text-xl font-semibold text-gray-600'>{dashData.patients}</p>
              <p className='text-gray-400'>Patients</p>
            </div>
          </div>
        </div>


        <div className='bg-white rounded border border-gray-200 mt-10 shadow-sm'>
          <div className='flex items-center gap-2.5 px-6 py-4 rounded-t border-b border-gray-200'>
            <img src={assets.list_icon} alt=''/>
            <p className='font-semibold text-gray-800'>Latest Bookings</p>
          </div>

          <div className='flex flex-col'>
            {
              dashData.latestAppointments.map((item, index) => (
                <div className='flex flex-col sm:flex-row items-center justify-between px-6 py-4 gap-4 sm:gap-3 hover:bg-gray-50 border-b border-gray-200 last:border-b-0 transition-colors' key={index}>
                  <div className='flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left w-full sm:w-auto'>
                    <img className='rounded-full w-12 h-12 object-cover border border-gray-200 shadow-sm mx-auto sm:mx-0' src={item.docData.image} alt=''/>
                    <div className='text-sm'>
                      <p className='text-gray-800 font-semibold'>{item.docData.name}</p>
                      <p className='text-gray-500 mt-0.5'>{slotDateFormat(item.slotDate)}</p>
                    </div>
                  </div>
                  {
                    item.cancelled 
                    ? <p className='text-red-500 text-xs font-semibold py-1 px-3 bg-red-50 rounded-full border border-red-100 sm:border-0 sm:bg-transparent'>Cancelled</p>
                    : item.isCompleted 
                    ? <p className='text-green-500 text-xs font-semibold py-1 px-3 bg-green-50 rounded-full border border-green-100 sm:border-0 sm:bg-transparent'>Completed</p>
                    : <div className='flex items-center justify-center'>
                        <button
                          onClick={() => cancelAppointment(item._id)}
                          className='w-9 h-9 rounded-full border border-red-200 bg-white hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer shrink-0'
                          aria-label="Cancel Appointment"
                        >
                          <img className='w-4 h-4 object-contain' src={assets.cancel_icon} alt='Cancel' />
                        </button>
                      </div>
                  }
                </div>
              ))
            }
          </div>
        </div>
    </div>
  )
}

export default Dashboard