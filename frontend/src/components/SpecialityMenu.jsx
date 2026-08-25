import React from 'react'
import { specialityData } from '../assets/assets'
import { Link } from 'react-router-dom'

const SpecialityMenu = () => {
  return (
    <section className='flex flex-col items-center gap-4 py-16 text-gray-800' id='speciality'>
        
        {/* Section Header */}
        <div className='inline-flex items-center gap-2 bg-indigo-50 text-[#5F6FFF] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider'>
          Medical Departments
        </div>
        
        <h2 className='text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight text-center'>
          Find Specialist by Category
        </h2>
        
        <p className='sm:w-1/2 text-center text-sm text-gray-500 max-w-lg'>
          Connect directly with specialized physicians across top departments. Click a speciality to view available consultations.
        </p>

        {/* Specialities Grid / Scroll */}
        <div className='flex gap-4 sm:gap-6 pt-6 w-full overflow-x-auto pb-4 px-2 sm:justify-center scrollbar-none'>
            {specialityData.map((item, index) => (
                <Link 
                    onClick={() => scrollTo(0, 0)} 
                    className='group flex flex-col items-center text-xs font-semibold cursor-pointer flex-shrink-0 p-3 rounded-2xl hover:bg-indigo-50/50 hover:shadow-md hover:border-indigo-200 border border-transparent transition-all duration-300' 
                    key={index} 
                    to={`/doctors/${item.speciality}`}
                >
                    <div className='w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-50/70 group-hover:bg-[#5F6FFF] flex items-center justify-center p-3 transition-colors duration-300 shadow-xs'>
                        <img 
                            className='w-full h-full object-contain group-hover:brightness-0 group-hover:invert transition-all duration-300' 
                            src={item.image} 
                            alt={item.speciality}
                        />
                    </div>
                    <p className='mt-2.5 text-gray-700 group-hover:text-[#5F6FFF] transition-colors text-center text-[12px] sm:text-[13px]'>
                      {item.speciality}
                    </p>
                </Link>
            ))}
        </div>
    </section>
  )
}

export default SpecialityMenu