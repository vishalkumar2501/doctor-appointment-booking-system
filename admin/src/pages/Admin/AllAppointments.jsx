import React from 'react'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const AllAppointments = () => {

  const {aToken, appointments, getAllAppointments, cancelAppointment} = useContext(AdminContext)
  const {calculateAge, slotDateFormat, currency} = useContext(AppContext)

  useEffect(() => {
    if(aToken){
      getAllAppointments()
    }
  },[aToken])

  return (
    <div className='max-w-6xl'>
        <p className='mb-4 text-xl font-semibold text-gray-800'>
          App Appointments
        </p>

        {/* Desktop View Table */}
        <div className='hidden sm:block bg-white border border-gray-200 rounded-xl text-sm max-h-[80vh] min-h-[60vh] overflow-y-auto shadow-sm'>
          
          <div className='grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] py-3 px-6 border-b border-gray-200 bg-gray-50 text-gray-700 font-medium'>
            <p>#</p>
            <p>Patient</p>
            <p>Age</p>
            <p>Date & Time</p>
            <p>Doctor</p>
            <p>Fees</p>
            <p className='text-center'>Actions</p>
          </div>

          {
            appointments.slice().reverse().map((item, index) => (
              <div
                key={index}
                className='grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-600 py-3 px-6 border-b border-gray-100 hover:bg-gray-50 transition-colors'
              >
                <p className='font-medium text-gray-500'>{index+1}</p>

                <div className='flex items-center gap-3'>
                  <img className='w-9 h-9 rounded-full object-cover border' src={item.userData.image} alt=''/>
                  <p className='font-medium text-gray-700'>{item.userData.name}</p>
                </div>

                <p>{calculateAge(item.userData.dob)}</p>

                <p className='text-gray-500'>
                  {slotDateFormat(item.slotDate)}, {item.slotTime}
                </p>

                <div className='flex items-center gap-3'>
                  <img className='w-9 h-9 rounded-full object-cover bg-gray-200 border' src={item.docData.image} alt=''/>
                  <p className='font-medium text-gray-700'>{item.docData.name}</p>
                </div>

                <p className='font-medium text-gray-700'>
                  {currency}{item.amount}
                </p>

                {
                  item.cancelled 
                  ? <p className='text-red-500 text-xs font-semibold text-center'>Cancelled</p>
                  : item.isCompleted 
                  ? <p className='text-green-500 text-xs font-medium text-center'>Completed</p>
                  : <div className='flex justify-center'>
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
 
        {/* Mobile View Cards */}
        <div className='sm:hidden flex flex-col gap-4 w-full'>
          {appointments.length === 0 ? (
            <div className='py-12 text-center text-gray-400 bg-white border border-gray-200 rounded-lg shadow-sm'>
              No appointments found.
            </div>
          ) : (
            appointments.slice().reverse().map((item, index) => (
              <div key={index} className='bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-4'>
                {/* Patient Information */}
                <div className='flex items-center gap-3 border-b border-gray-100 pb-3'>
                  <img className='w-12 h-12 rounded-full object-cover border border-gray-200' src={item.userData.image} alt='' />
                  <div>
                    <p className='text-gray-800 font-semibold text-base'>{item.userData.name}</p>
                    <p className='text-gray-500 text-xs mt-0.5'>Age: {calculateAge(item.userData.dob)} years</p>
                  </div>
                </div>
 
                {/* Doctor Information */}
                <div className='flex items-center gap-3 border-b border-gray-100 pb-3'>
                  <span className='text-xs text-gray-400 font-medium shrink-0'>Doctor:</span>
                  <div className='flex items-center gap-2'>
                    <img className='w-9 h-9 rounded-full object-cover border border-gray-200' src={item.docData.image} alt='' />
                    <p className='text-gray-700 font-semibold text-sm'>{item.docData.name}</p>
                  </div>
                </div>
 
                {/* Appointment Info & Payment Details */}
                <div className='grid grid-cols-2 gap-y-2.5 text-xs text-gray-600'>
                  <div>
                    <p className='text-gray-400 font-medium'>Date & Time</p>
                    <p className='text-gray-700 font-semibold mt-0.5'>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
                  </div>
                  <div>
                    <p className='text-gray-400 font-medium'>Payment Method</p>
                    <div className='mt-0.5'>
                      <span className='text-[10px] border border-[#5F6FFF] px-2 py-0.5 rounded-full bg-indigo-50/50 text-[#5F6FFF] font-semibold'>
                        {item.payment ? 'Online' : 'CASH'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className='text-gray-400 font-medium'>Fees</p>
                    <p className='text-gray-800 font-bold text-sm mt-0.5'>{currency}{item.amount}</p>
                  </div>
                  <div>
                    <p className='text-gray-400 font-medium'>Status</p>
                    <div className='mt-0.5'>
                      {item.cancelled ? (
                        <span className='text-red-500 text-xs font-semibold'>Cancelled</span>
                      ) : item.isCompleted ? (
                        <span className='text-green-500 text-xs font-semibold'>Completed</span>
                      ) : (
                        <span className='text-amber-500 text-xs font-semibold'>Pending</span>
                      )}
                    </div>
                  </div>
                </div>
 
                {/* Actions */}
                {!item.cancelled && !item.isCompleted && (
                  <div className='flex items-center justify-end gap-2.5 mt-2 pt-3 border-t border-gray-100'>
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className='w-9 h-9 rounded-full border border-red-200 bg-white hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer shrink-0'
                      aria-label="Cancel Appointment"
                    >
                      <img className='w-4 h-4 object-contain' src={assets.cancel_icon} alt='Cancel' />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

    </div>
  )
}

export default AllAppointments
