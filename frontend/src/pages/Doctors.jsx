import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Doctors = () => {

    const {speciality} = useParams()
    const [filterDoc, setFilterDoc] = useState([])
    const [showFilter, setShowFilter] = useState(false) //for mobile
    const navigate = useNavigate()

    const [city, setCity] = useState('')
    const [searchCity, setSearchCity] = useState('')
    const [loading, setLoading] = useState(false)

    const { backendUrl } = useContext(AppContext)

    const fetchFilteredDoctors = async () => {
        try {
            setLoading(true)
            let url = `${backendUrl}/api/doctor/list`
            const params = []
            if (searchCity.trim()) {
                params.push(`city=${encodeURIComponent(searchCity.trim())}`)
            }
            if (speciality) {
                params.push(`speciality=${encodeURIComponent(speciality)}`)
            }
            if (params.length > 0) {
                url += `?${params.join('&')}`
            }
            const { data } = await axios.get(url)
            if (data.success) {
                setFilterDoc(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error("Unable to load doctors. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFilteredDoctors()
    }, [searchCity, speciality])

    const handleSpecialityClick = (targetSpeciality) => {
        if (speciality === targetSpeciality) {
            navigate('/doctors')
        } else {
            navigate(`/doctors/${targetSpeciality}`)
        }
        setShowFilter(false)
    }

    const getEmptyMessage = () => {
        if (searchCity && speciality) {
            const specPlural = speciality.endsWith('s') ? speciality : `${speciality}s`;
            return `No ${specPlural} found in ${searchCity.trim()}.`;
        } else if (searchCity) {
            return `No doctors found in ${searchCity.trim()}.`;
        } else if (speciality) {
            const specPlural = speciality.endsWith('s') ? speciality : `${speciality}s`;
            return `No ${specPlural} available.`;
        } else {
            return "No doctors available.";
        }
    }

  return (
    <div>
        <p className='text-gray-600'>Browse through the doctors specialist.</p>
        
        {/* City Search Bar */}
        <div className='mt-4 max-w-md flex gap-2 w-full sm:w-auto'>
            <input
                type='text'
                placeholder='Enter city name'
                disabled={loading}
                className='border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#5F6FFF] w-full bg-white text-gray-800 disabled:opacity-50'
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) {
                        setSearchCity(city.trim())
                    }
                }}
            />
            <button
                disabled={loading}
                onClick={() => setSearchCity(city.trim())}
                className='bg-[#5F6FFF] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#4b5cff] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
            >
                Search
            </button>
            {searchCity && (
                <button
                    disabled={loading}
                    onClick={() => {
                        setCity('')
                        setSearchCity('')
                    }}
                    className='border border-gray-300 text-gray-600 px-3 py-2.5 rounded-lg text-sm hover:bg-gray-50 cursor-pointer bg-white disabled:opacity-50'
                >
                    Clear
                </button>
            )}
        </div>

        <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
            <button className={`w-full py-2.5 px-4 mb-2 border rounded-lg text-sm font-semibold transition-all sm:hidden ${showFilter ? 'bg-[#5F6FFF] text-white border-[#5F6FFF]' : 'border-gray-300 text-gray-700 bg-white'}`}
                onClick={() => setShowFilter(prev => !prev)}>
                Filter by Speciality
            </button>
            <div className={`flex-col gap-4 text-sm text-gray-600 w-full sm:w-auto ${showFilter ? 'flex mb-4' : 'hidden sm:flex'}`}>
                <p onClick={() => handleSpecialityClick('General physician')} className={`w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'General physician' ? 'bg-indigo-100 text-black' : ''}`}>General physician</p>
                <p onClick={() => handleSpecialityClick('Gynecologist')} className={`w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Gynecologist' ? 'bg-indigo-100 text-black' : ''}`}>Gynecologist</p>
                <p onClick={() => handleSpecialityClick('Dermatologist')} className={`w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Dermatologist' ? 'bg-indigo-100 text-black' : ''}`}>Dermatologist</p>
                <p onClick={() => handleSpecialityClick('Pediatricians')} className={`w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Pediatricians' ? 'bg-indigo-100 text-black' : ''}`}>Pediatricians</p>
                <p onClick={() => handleSpecialityClick('Neurologist')} className={`w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Neurologist' ? 'bg-indigo-100 text-black' : ''}`}>Neurologist</p>
                <p onClick={() => handleSpecialityClick('Gastroenterologist')} className={`w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Gastroenterologist' ? 'bg-indigo-100 text-black' : ''}`}>Gastroenterologist</p>
            </div>
 
            <div className='w-full grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 gap-y-6'>
                {
                    loading ? (
                        <div className='text-center text-gray-500 py-10 w-full col-span-full'>
                            <p className='text-lg font-medium'>Loading doctors...</p>
                        </div>
                    ) : filterDoc.length === 0 ? (
                        <div className='text-center text-gray-500 py-10 w-full col-span-full bg-gray-50 rounded-xl border border-dashed border-gray-300 px-4'>
                            <p className='text-lg font-medium text-gray-700'>{getEmptyMessage()}</p>
                            <p className='text-sm text-gray-400 mt-1'>Try adjusting your city search or speciality filter.</p>
                        </div>
                    ) : (
                        filterDoc.map((item, index) => (
                            <div onClick={() => {navigate(`/appointment/${item._id}`); scrollTo(0,0)}} className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500 bg-white' key={index}>
                                <img className='bg-blue-50 w-full h-60 object-cover' src={item.image} alt=''/>
                                <div className='p-4'>
                                    <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-green-500' : 'text-gray-500'} `}>
                                        <p className={`w-2 h-2 ${item.available ? 'bg-green-500' : 'bg-gray-500'}  rounded-full`}></p> <p>{item.available ? 'Available' : 'Not Available'}</p>
                                    </div>
     
                                    <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                                    <p className='text-gray-600 text-sm'>{item.speciality}</p>
                                    {item.city && (
                                        <p className='text-gray-400 text-xs mt-1'>📍 {item.city}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )
                }
            </div>
        </div>
    </div>
  )
}
 
export default Doctors