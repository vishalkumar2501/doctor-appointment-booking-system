import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import {assets} from '../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'

const MyProfile = () => {

  const {userData, setUserData, token, backendUrl, loadUserProfileData} = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(false)
  const [loading, setLoading] = useState(false)

  const updateUserProfileData = async() => {
    if (!userData.name || !userData.name.trim()) {
      toast.warn('Name cannot be empty')
      return
    }
    if (!userData.phone || !userData.phone.trim()) {
      toast.warn('Phone number cannot be empty')
      return
    }

    try{
      setLoading(true)
      const formData = new FormData()

      formData.append('name', userData.name.trim())
      formData.append('phone', userData.phone.trim())
      formData.append('address', JSON.stringify(userData.address))
      formData.append('gender', userData.gender)
      formData.append('dob', userData.dob)

      image && formData.append('image', image)

      const {data} = await axios.post(backendUrl + '/api/user/update-profile', formData, {headers:{token}})

      if(data.success){
        toast.success(data.message)
        await loadUserProfileData()
        setIsEdit(false)
        setImage(false)
      }
      else{
        toast.error(data.message)
        await loadUserProfileData()
      }
    }
    catch(error){
      console.log(error)
      if (error.response?.status !== 401) {
        toast.error(error.message)
      }
      await loadUserProfileData()
    } finally {
      setLoading(false)
    }
  }

  return userData && (
    <div className='max-w-lg flex flex-col gap-4 text-sm w-full mx-auto sm:mx-0 px-2 sm:px-0 py-6 sm:py-0'>
        <div className='flex flex-col items-center sm:items-start w-full text-center sm:text-left'>
            {
              isEdit
              ? <label htmlFor='image' className='cursor-pointer block relative'>
                  <div className='w-36 h-36 rounded-full overflow-hidden border border-gray-200 shadow-sm relative mx-auto'>
                    <img className='w-full h-full object-cover opacity-75' src={image ? URL.createObjectURL(image) : userData.image} alt='' />
                    <img className='w-10 absolute inset-0 m-auto' src={image ? '' : assets.upload_icon} alt='' />
                  </div>
                  <input onChange={(e) => setImage(e.target.files[0])} type='file' id='image' accept="image/*" hidden/>
                </label>
              : <div className='w-36 h-36 rounded-full overflow-hidden border border-gray-200 shadow-sm mx-auto sm:mx-0'>
                  <img className='w-full h-full object-cover' src={userData.image} alt=''/>
                </div>
            }

            {
              isEdit
              ? <input className='bg-gray-50 text-3xl font-medium w-full sm:max-w-60 mt-4 focus:outline-none focus:ring-1 focus:ring-gray-400 border border-gray-300 rounded px-2 py-1 text-center sm:text-left' type='text' value={userData.name} onChange={(e) => setUserData(prev => ({...prev, name:e.target.value}))}/>
              : <p className='font-medium text-3xl text-neutral-800 mt-4'>{userData.name}</p>
            }
        </div>

        <hr className='bg-zinc-300 h-[1px] border-none my-2'/>

        <div className='w-full'>
          <p className='text-neutral-500 underline mt-3 text-center sm:text-left'>CONTACT INFORMATION</p>
          <div className='grid grid-cols-1 sm:grid-cols-[1fr_3fr] gap-y-3 sm:gap-y-2.5 mt-3 text-neutral-700 text-center sm:text-left'>
            <p className='font-medium'>Email id:</p>
            <p className='text-blue-500 break-all sm:break-normal'>{userData.email}</p>

            <p className='font-medium'>Phone:</p>
            {
              isEdit
              ? <input className='bg-gray-100 w-full sm:max-w-52 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 border border-gray-300 px-3 py-1.5' type='text' value={userData.phone} onChange={(e) => setUserData(prev => ({...prev, phone:e.target.value}))}/>
              : <p className='text-gray-500'>{userData.phone}</p>
            }

            <p className='font-medium'>Address:</p>
            {
              isEdit
              ? <div className='flex flex-col gap-2 w-full'>
                  <input className='bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 border border-gray-300 w-full px-3 py-1.5' onChange={(e) => setUserData(prev => ({...prev, address: {...prev.address, line1: e.target.value}}))} value={userData.address.line1} type='text'/>
                  <input className='bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 border border-gray-300 w-full px-3 py-1.5' onChange={(e) => setUserData(prev =>({...prev, address: {...prev.address, line2: e.target.value}}))} value={userData.address.line2} type='text'/>
                </div>
              : <p className='text-gray-500'>
                  {userData.address.line1}
                  <br/>
                  {userData.address.line2}
                </p>
            }
          </div>
        </div>

        <div className='w-full'>
          <p className='text-neutral-500 underline mt-3 text-center sm:text-left'>BASIC INFORMATION</p>
          <div className='grid grid-cols-1 sm:grid-cols-[1fr_3fr] gap-y-3 sm:gap-y-2.5 mt-3 text-neutral-700 text-center sm:text-left'>
            <p className='font-medium'>Gender:</p>
            {
              isEdit
              ? <select className='w-full sm:max-w-28 bg-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 border border-gray-300 px-3 py-1.5' value={userData.gender} onChange={(e) => setUserData(prev => ({...prev, gender: e.target.value}))}>
                  <option value='Not Selected'>Not Selected</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                </select>
              : <p className='text-gray-400'>{userData.gender}</p>
            }

            <p className='font-medium'>Birthday:</p>
            {
              isEdit
              ? <input className='w-full sm:max-w-40 bg-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 border border-gray-300 px-3 py-1.5' type='date' onChange={(e) => setUserData(prev => ({...prev, dob: e.target.value}))} value={userData.dob}/>
              : <p className='text-gray-400'>{userData.dob}</p>
            }
          </div>
        </div>

        <div className='mt-10 w-full flex justify-center sm:justify-start'>
          {
            isEdit
            ? <button disabled={loading} className={`w-full sm:w-auto border border-[#5F6FFF] sm:min-w-[180px] py-2.5 rounded-full text-[#5F6FFF] hover:bg-[#5F6FFF] hover:text-white transition-all duration-300 cursor-pointer block text-center font-medium ${loading ? 'opacity-70 cursor-not-allowed' : ''}`} onClick={updateUserProfileData}>{loading ? 'Saving...' : 'Save information'}</button>
            : <button className='w-full sm:w-auto border border-[#5F6FFF] sm:min-w-[180px] py-2.5 rounded-full text-[#5F6FFF] hover:bg-[#5F6FFF] hover:text-white transition-all duration-300 cursor-pointer block text-center font-medium' onClick={() => setIsEdit(true)}>Edit</button>
          }
        </div>
    </div>
  )
}

export default MyProfile

