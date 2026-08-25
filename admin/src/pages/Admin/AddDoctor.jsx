import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const AddDoctor = () => {

    const [docImg, setDocImg] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [experience, setExperience] = useState('1 Year')
    const [fees, setFees] = useState('')
    const [about, setAbout] = useState('')
    const [speciality, setSpeciality] = useState('General physician')
    const [degree, setDegree] = useState('')
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')
    const [city, setCity] = useState('')
    const [verificationCity, setVerificationCity] = useState('')

    const [loading, setLoading] = useState(false)

    const { backendUrl, aToken } = useContext(AdminContext)

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        if (loading) return
        try {
            if (!docImg) {
                return toast.error('Image Not Selected')
            }
            setLoading(true)
            const formData = new FormData()
            formData.append('image', docImg)
            formData.append('name', name)
            formData.append('email', email)
            formData.append('experience', experience)
            formData.append('fees', Number(fees))
            formData.append('about', about)
            formData.append('speciality', speciality)
            formData.append('degree', degree)
            formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))
            formData.append('city', city)
            formData.append('verificationCity', verificationCity)

            const { data } = await axios.post(
                backendUrl + '/api/admin/add-doctor',
                formData,
                { headers: { aToken } }
            )

            if (data.success) {
                toast.success(data.message)
                setDocImg(false)
                setName('')
                setEmail('')
                setFees('')
                setDegree('')
                setAbout('')
                setAddress1('')
                setAddress2('')
                setCity('')
                setVerificationCity('')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='max-w-4xl'>
            <p className='mb-4 text-xl font-semibold text-gray-800 tracking-wide'>
                Add Doctor
            </p>

            <div className='bg-white px-4 sm:px-8 py-6 sm:py-8 border border-gray-200 rounded-2xl w-full max-w-4xl shadow-md'>

                <div className='flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-8 text-gray-500 text-center sm:text-left'>
                    <label htmlFor='doc-img'>
                        <img
                            className='w-20 h-20 bg-gray-100 rounded-full cursor-pointer object-cover border border-gray-300 hover:shadow transition'
                            src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                            alt=''
                        />
                    </label>
                    <input onChange={(e) => setDocImg(e.target.files[0])} type='file' id='doc-img' hidden/>
                    <p className='leading-tight text-sm'>
                        Upload doctor <br/> picture
                    </p>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-x-10 lg:gap-y-4 text-gray-600 w-full'>
                    {/* Doctor Name */}
                    <div className='flex flex-col gap-1 order-1 lg:col-start-1 w-full'>
                        <p className='font-medium text-sm'>Doctor Name</p>
                        <input
                            className='border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5F6FFF] focus:border-[#5F6FFF] w-full text-sm'
                            type='text' placeholder='Name' required
                            onChange={(e) => setName(e.target.value)} value={name}
                        />
                    </div>

                    {/* Speciality */}
                    <div className='flex flex-col gap-1 order-2 lg:col-start-2 w-full'>
                        <p className='font-medium text-sm'>Speciality</p>
                        <select
                            className='border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5F6FFF] focus:border-[#5F6FFF] w-full text-sm'
                            onChange={(e) => setSpeciality(e.target.value)} value={speciality}
                        >
                            <option>General physician</option>
                            <option>Gynecologist</option>
                            <option>Dermatologist</option>
                            <option>Pediatricians</option>
                            <option>Neurologist</option>
                            <option>Gastroenterologist</option>
                        </select>
                    </div>

                    {/* Doctor Email */}
                    <div className='flex flex-col gap-1 order-3 lg:col-start-1 w-full'>
                        <p className='font-medium text-sm'>Doctor Email</p>
                        <input
                            className='border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5F6FFF] focus:border-[#5F6FFF] w-full text-sm'
                            type='email' placeholder='Email' required
                            onChange={(e) => setEmail(e.target.value)} value={email}
                        />
                    </div>

                    {/* Education */}
                    <div className='flex flex-col gap-1 order-4 lg:col-start-2 w-full'>
                        <p className='font-medium text-sm'>Education</p>
                        <input
                            className='border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5F6FFF] focus:border-[#5F6FFF] w-full text-sm'
                            type='text' placeholder='Education' required
                            onChange={(e) => setDegree(e.target.value)} value={degree}
                        />
                    </div>

                    {/* Address Line 1 */}
                    <div className='flex flex-col gap-1 order-6 lg:col-start-2 w-full'>
                        <p className='font-medium text-sm'>Address Line 1</p>
                        <input
                            className='border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5F6FFF] focus:border-[#5F6FFF] w-full text-sm'
                            type='text' placeholder='Address line 1' required
                            onChange={(e) => setAddress1(e.target.value)} value={address1}
                        />
                    </div>

                    {/* Experience */}
                    <div className='flex flex-col gap-1 order-7 lg:col-start-1 w-full'>
                        <p className='font-medium text-sm'>Experience</p>
                        <select
                            className='border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5F6FFF] focus:border-[#5F6FFF] w-full text-sm'
                            onChange={(e) => setExperience(e.target.value)} value={experience}
                        >
                            <option>1 Year</option><option>2 Year</option><option>3 Year</option>
                            <option>4 Year</option><option>5 Year</option><option>6 Year</option>
                            <option>7 Year</option><option>8 Year</option><option>9 Year</option>
                            <option>10 Year</option>
                        </select>
                    </div>

                    {/* Address Line 2 */}
                    <div className='flex flex-col gap-1 order-8 lg:col-start-2 w-full'>
                        <p className='font-medium text-sm'>Address Line 2</p>
                        <input
                            className='border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5F6FFF] focus:border-[#5F6FFF] w-full text-sm'
                            type='text' placeholder='Address line 2' required
                            onChange={(e) => setAddress2(e.target.value)} value={address2}
                        />
                    </div>

                    {/* Fees */}
                    <div className='flex flex-col gap-1 order-9 lg:col-start-1 w-full'>
                        <p className='font-medium text-sm'>Fees</p>
                        <input
                            className='border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5F6FFF] focus:border-[#5F6FFF] w-full text-sm'
                            type='number' placeholder='Fees' required
                            onChange={(e) => setFees(e.target.value)} value={fees}
                        />
                    </div>

                    {/* Doctor Working City */}
                    <div className='flex flex-col gap-1 order-10 lg:col-start-1 w-full'>
                        <p className='font-medium text-sm'>Doctor Working City</p>
                        <input
                            className='border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5F6FFF] focus:border-[#5F6FFF] w-full text-sm'
                            type='text' placeholder='Working city (e.g. Pune)' required
                            onChange={(e) => setCity(e.target.value)} value={city}
                        />
                    </div>

                    {/* Verification City */}
                    <div className='flex flex-col gap-1 order-11 lg:col-start-2 w-full'>
                        <p className='font-medium text-sm'>Verification Office / City</p>
                        <input
                            className='border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5F6FFF] focus:border-[#5F6FFF] w-full text-sm'
                            type='text' placeholder='Verification city (e.g. Pune)' required
                            onChange={(e) => setVerificationCity(e.target.value)} value={verificationCity}
                        />
                    </div>
                </div>

                <div>
                    <p className='mt-5 mb-2 font-medium text-sm'>About Doctor</p>
                    <textarea
                        className='w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5F6FFF] text-sm resize-y'
                        rows={5} placeholder='Write about doctor' required
                        onChange={(e) => setAbout(e.target.value)} value={about}
                    />
                </div>

                <button
                    type='submit'
                    disabled={loading}
                    className={`w-full sm:w-auto bg-[#5F6FFF] px-12 py-3 mt-6 text-white text-sm font-semibold rounded-full hover:bg-[#4b5cff] hover:shadow-md transition-all text-center ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}>
                    {loading ? 'Adding Doctor...' : 'Add Doctor'}
                </button>
            </div>
        </form>
    )
}

export default AddDoctor
