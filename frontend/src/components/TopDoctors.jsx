import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const TopDoctors = () => {
    const navigate = useNavigate()
    const { doctors, currencySymbol } = useContext(AppContext)

    return (
        <section className='flex flex-col items-center gap-4 my-20 text-gray-900'>
            
            {/* Header */}
            <div className='inline-flex items-center gap-2 bg-indigo-50 text-[#5F6FFF] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider'>
                Top Rated Physicians
            </div>

            <h2 className='text-3xl sm:text-4xl font-extrabold text-center text-gray-900 tracking-tight'>
                Recommended Doctors to Book
            </h2>
            
            <p className='sm:w-1/2 text-center text-sm text-gray-500 max-w-md'>
                Explore our certified doctors with verified patient reviews and book your consultation in seconds.
            </p>

            {/* Doctors Grid */}
            <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 pt-6 px-2 sm:px-0'>
                {doctors.slice(0, 10).map((item, index) => (
                    <div 
                        onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0) }} 
                        className='group bg-white border border-gray-100 hover:border-indigo-200 rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between' 
                        key={index}
                    >
                        <div className='relative bg-gradient-to-b from-indigo-50/60 to-blue-50/30 overflow-hidden h-56 flex items-center justify-center'>
                            <img 
                                className='w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500' 
                                src={item.image} 
                                alt={item.name}
                            />
                            
                            {/* Live Availability Badge */}
                            <div className='absolute top-3 left-3'>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-xs ${
                                    item.available 
                                        ? 'bg-emerald-50/95 text-emerald-700 border border-emerald-200' 
                                        : 'bg-gray-100/90 text-gray-600 border border-gray-200'
                                }`}>
                                    <span className={`w-2 h-2 rounded-full ${item.available ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                    {item.available ? 'Available' : 'Unavailable'}
                                </span>
                            </div>

                            {/* Fee Badge if available */}
                            {item.fees && (
                                <div className='absolute top-3 right-3 bg-white/90 backdrop-blur-md text-gray-800 text-[11px] font-bold px-2 py-0.5 rounded-lg border border-gray-200/60 shadow-xs'>
                                    {currencySymbol || '$'}{item.fees}
                                </div>
                            )}
                        </div>

                        {/* Card Body */}
                        <div className='p-4 flex flex-col gap-1.5'>
                            <span className='text-[11px] font-semibold uppercase tracking-wider text-[#5F6FFF]'>
                                {item.speciality}
                            </span>
                            
                            <h3 className='text-gray-900 text-base font-bold truncate group-hover:text-[#5F6FFF] transition-colors'>
                                {item.name}
                            </h3>

                            <p className='text-xs text-gray-500 truncate'>
                                {item.degree || 'Medical Practitioner'} • {item.experience || 'Experienced'}
                            </p>

                            <div className='mt-3 pt-3 border-t border-gray-100 flex items-center justify-between'>
                                <span className='text-xs font-semibold text-indigo-600 group-hover:underline'>
                                    Book Now →
                                </span>
                                <span className='text-[11px] text-gray-400'>
                                    ⭐ 4.9 (50+)
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* View More Button */}
            <button 
                onClick={() => { navigate('/doctors'); scrollTo(0, 0) }} 
                className='bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 hover:bg-[#5F6FFF] hover:text-white font-semibold text-xs sm:text-sm px-10 py-3.5 rounded-full mt-10 border border-indigo-100 hover:border-[#5F6FFF] hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 cursor-pointer'
            >
                Explore All Doctors (100+)
            </button>
        </section>
    )
}

export default TopDoctors