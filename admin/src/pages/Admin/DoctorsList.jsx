import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {

  const {doctors, aToken, getAllDoctors, changeAvailability, resendInvitation} = useContext(AdminContext)
  const [resendingId, setResendingId] = useState(null)

  const handleResend = async (docId) => {
    if (resendingId) return
    setResendingId(docId)
    await resendInvitation(docId)
    setResendingId(null)
  }

  useEffect(() => {
    if(aToken){
      getAllDoctors()
    }
  }, [aToken])

  return (
    <div className='max-w-5xl w-full'>
        <h1 className='text-lg font-medium text-gray-800'>All Doctors</h1>

        <div className='w-full grid grid-cols-1 sm:flex sm:flex-wrap gap-4 pt-5 gap-y-6 justify-center sm:justify-start'>
          {
            doctors.length === 0 ? (
              <div className='py-12 text-center text-gray-400 bg-white border border-gray-200 rounded-lg shadow-sm w-full'>
                No doctors registered yet.
              </div>
            ) : (
              doctors.map((item, index) => (
                <div className='border border-indigo-200 rounded-xl w-full sm:max-w-56 overflow-hidden cursor-pointer group bg-white shadow-sm flex flex-col justify-between' key={index}>
                  <img className='bg-indigo-50 group-hover:bg-[#5F6FFF] transition-all duration-500 w-full h-56 object-cover mx-auto' src={item.image} alt=''/>

                  <div className='p-4 flex-1 flex flex-col justify-between gap-1.5'>
                    <div>
                      <p className='text-neutral-800 text-lg font-semibold break-words leading-tight'>{item.name}</p>
                      <p className='text-zinc-500 text-sm break-words mt-1'>{item.speciality}</p>
                    </div>

                    <div>
                      <div className='mt-3 flex items-center gap-2 text-sm text-gray-600 py-1.5 px-3 bg-gray-50/50 rounded-lg border border-gray-100 w-fit sm:bg-transparent sm:border-0 sm:p-0 sm:mt-2'>
                        <input 
                          onChange={() => changeAvailability(item._id)} 
                          type='checkbox' 
                          checked={item.available} 
                          id={`availability-toggle-${item._id}`}
                          className='w-4 h-4 accent-[#5F6FFF] cursor-pointer'
                        />
                        <label htmlFor={`availability-toggle-${item._id}`} className='cursor-pointer select-none font-medium text-gray-700'>Available</label>
                      </div>

                      {item.status === 'INVITED' && (
                        <div className='mt-2.5 pt-2.5 border-t border-gray-100 flex flex-col gap-1.5 w-full'>
                          <span className='text-[11px] bg-amber-50 text-amber-600 font-medium px-2 py-0.5 rounded-full border border-amber-100 w-fit'>Pending Invitation</span>
                          <button 
                            type="button"
                            disabled={resendingId !== null}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResend(item._id);
                            }}
                            className={`text-xs bg-[#5F6FFF] hover:bg-[#4b5cff] text-white py-1.5 px-3 rounded font-medium transition-colors cursor-pointer text-center ${resendingId !== null ? 'opacity-70 cursor-not-allowed' : ''}`}
                          >
                            {resendingId === item._id ? 'Sending...' : 'Resend Invite'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          }
        </div>
    </div>
  )
}

export default DoctorsList