import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorProfile = () => {

  const {dToken, profileData, setProfileData, getProfileData, backendUrl} = useContext(DoctorContext)
  const {currency} = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)

  const updateProfile = async() => {
    try{
      const updateData = {
        address: profileData.address,
        fees: profileData.fees,
        available: profileData.available,
      }

      const {data} = await axios.post(backendUrl + '/api/doctor/update-profile', updateData, {headers: {token: dToken}})

      if(data.success){
        toast.success(data.message)
        setIsEdit(false)
        getProfileData()
      }
      else{
        toast.error(data.message)
      }
    }
    catch(error){
      console.log(error)
      if (error.response?.status !== 401) {
        toast.error(error.message)
      }
    }
  }

  useEffect(() => {
    if(dToken){
      getProfileData()
    }
  }, [dToken])

  return profileData && (
    <div className='max-w-3xl'>
        <div className='flex flex-col gap-4 my-5'>
          <div className='flex justify-center sm:justify-start w-full'>
            <img className='bg-[#5F6FFF]/80 w-40 h-40 sm:w-auto sm:max-w-64 rounded-full sm:rounded-lg object-cover shadow-sm' src={profileData.image} alt=''/>
          </div>

          <div className='flex-1 border border-stone-100 rounded-lg p-6 sm:p-8 py-7 bg-white shadow-sm'>
            {/* ----- Doc Info : name, degree, experience ------ */}
            <p className='flex items-center gap-2 text-2xl sm:text-3xl font-medium text-gray-700 justify-center sm:justify-start'>{profileData.name}</p>
            <div className='flex items-center gap-2 mt-1.5 text-gray-600 justify-center sm:justify-start text-sm sm:text-base'>
              <p>{profileData.degree} - {profileData.speciality}</p>
              <button className='py-0.5 px-2 border border-gray-300 text-xs rounded-full cursor-default select-none'>{profileData.experience}</button>
            </div>

            {/* ----- Doc About ------ */}
            <div className='mt-5'>
              <p className='flex items-center gap-1 text-sm font-bold text-neutral-800'>About:</p>
              {isEdit ? (
                <textarea 
                  onChange={(e) => setProfileData(prev => ({...prev, about: e.target.value}))} 
                  value={profileData.about}
                  rows={4}
                  className='w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-[#5F6FFF] font-medium text-gray-700 bg-white text-sm mt-1.5 resize-y'
                />
              ) : (
                <p className='text-sm text-gray-600 max-w-[700px] mt-1.5 leading-relaxed break-words'>{profileData.about}</p>
              )}
            </div>

            <div className='text-gray-600 font-medium mt-6 flex flex-col sm:flex-row sm:items-center gap-1.5 text-sm'>
              <span>Appointment fee:</span> 
              <span className='text-gray-800 font-semibold'>
                {currency} {isEdit ? (
                  <input 
                    type='number' 
                    onChange={(e) => setProfileData(prev => ({...prev, fees: e.target.value}))} 
                    value={profileData.fees}
                    className='w-full sm:w-auto mt-1 sm:mt-0 px-3 py-1.5 border border-stone-200 rounded focus:outline-none focus:border-[#5F6FFF] text-gray-800 text-sm font-medium'
                  />
                ) : (
                  profileData.fees
                )}
              </span> 
            </div>

            <div className='flex flex-col sm:flex-row gap-2 py-3 border-y border-gray-50 my-4 text-sm text-gray-600 w-full'>
              <p className='font-medium shrink-0'>Address:</p>
              <div className='text-sm w-full'>
                {isEdit ? (
                  <div className='flex flex-col gap-2 w-full mt-1 sm:mt-0'>
                    <input 
                      type='text' 
                      onChange={(e) => setProfileData(prev => ({...prev, address: { ...prev.address, line1: e.target.value } }))} 
                      value={profileData.address.line1}
                      className='w-full px-3 py-1.5 border border-stone-200 rounded focus:outline-none focus:border-[#5F6FFF] text-gray-800 text-sm font-medium'
                    />
                    <input 
                      type='text' 
                      onChange={(e) => setProfileData(prev => ({...prev, address: { ...prev.address, line2: e.target.value } }))} 
                      value={profileData.address.line2}
                      className='w-full px-3 py-1.5 border border-stone-200 rounded focus:outline-none focus:border-[#5F6FFF] text-gray-800 text-sm font-medium'
                    />
                  </div>
                ) : (
                  <p className='text-gray-700 font-medium'>
                    {profileData.address.line1}
                    <br/>
                    {profileData.address.line2}
                  </p>
                )}
              </div>
            </div>

            <div className='flex items-center gap-2 pt-1 text-sm text-gray-600'>
              <input 
                onChange={() => isEdit && setProfileData(prev => ({...prev, available: !prev.available}))} 
                checked={profileData.available} 
                type='checkbox' 
                id='doc-available-checkbox'
                className='w-4 h-4 accent-[#5F6FFF] cursor-pointer'
              />
              <label htmlFor='doc-available-checkbox' className='font-medium cursor-pointer select-none'>Available</label>
            </div>

            {
              isEdit 
              ? <button onClick={updateProfile} className='w-full sm:w-25 px-4 py-2 sm:py-1.5 border border-[#5F6FFF] text-sm font-semibold rounded-full mt-6 cursor-pointer hover:bg-[#5F6FFF] hover:text-white transition-all text-center bg-white text-[#5F6FFF]'>Save</button>
              : <button onClick={() => setIsEdit(true)} className='w-full sm:w-25 px-4 py-2 sm:py-1.5 border border-[#5F6FFF] text-sm font-semibold rounded-full mt-6 cursor-pointer hover:bg-[#5F6FFF] hover:text-white transition-all text-center bg-white text-[#5F6FFF]'>Edit</button>
            }
            
          </div>
        </div>
    </div>
  )
}

export default DoctorProfile