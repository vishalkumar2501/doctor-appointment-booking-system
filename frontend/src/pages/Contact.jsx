import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div className="bg-gray-50 w-full pb-10">
      
      <div className="text-center pt-14">
        <p className="text-3xl font-light tracking-wide text-gray-500">
          CONTACT <span className="text-gray-800 font-semibold">US</span>
        </p>
        <div className="w-16 h-1 bg-[#5F6FFF] mx-auto mt-3 rounded"></div>
      </div>

      <div className="my-14 mx-auto max-w-5xl bg-white rounded-xl shadow-md p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center mb-28">
        <img className="w-full md:max-w-[360px] rounded-lg object-cover" src={assets.contact_image} alt=''/>

        <div className="flex flex-col gap-6 text-sm text-gray-600">
          <p className="font-semibold text-xl text-gray-700">Our Office</p>

          <p>53709 Willms Station <br /> Suite 350, Washington, USA</p>

          <p>
            <span className="font-medium text-gray-700">Tel:</span> (415) 555-0132 <br />
            <span className="font-medium text-gray-700">Email:</span> exampledev@gmail.com
          </p>

          <div className="pt-4">
            <p className="font-semibold text-xl text-gray-700">Careers at DocBook</p>
            <p className="mt-2 text-gray-500">
              Learn more about our teams and current job openings.
            </p>
          </div>

          <button className="mt-4 w-fit border border-[#5F6FFF] text-[#5F6FFF] px-8 py-3 rounded-md text-sm font-medium hover:bg-[#5F6FFF] hover:text-white transition-all duration-300 cursor-pointer">
            Explore Jobs
          </button>
        </div>
      </div>
    </div>
  )
}

export default Contact
