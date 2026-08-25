import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div className="bg-gray-50 w-full pb-10">

      <div className="text-center pt-14">
        <p className="text-3xl font-light tracking-wide text-gray-500">
          ABOUT <span className="text-gray-800 font-semibold">US</span>
        </p>
        <div className="w-16 h-1 bg-[#5F6FFF] mx-auto mt-3 rounded"></div>
      </div>

      <div className="my-14 mx-auto max-w-6xl bg-white rounded-xl shadow-md p-8 md:p-12 flex flex-col md:flex-row gap-14 items-center">

        <img className="w-full md:max-w-[360px] rounded-lg object-cover" src={assets.about_image} alt=''/>

        <div className="flex flex-col gap-6 md:w-2/4 text-sm text-gray-600 leading-relaxed">
          <p>Welcome to <span className="font-semibold text-gray-800">DocBook</span>, your trusted partner in managing healthcare needs conveniently and efficiently. We understand the challenges individuals face when scheduling appointments and managing health records.</p>

          <p>DocBook is committed to excellence in healthcare technology. We continuously enhance our platform using modern innovations to deliver a seamless and reliable user experience.</p>
          <p className="text-lg font-semibold text-gray-800">Our Vision</p>
          <p>Our vision at DocBook is to create a seamless healthcare experience for every user by bridging the gap between patients and healthcare providers.</p>
        </div>
      </div>

      <div className="text-center mt-20 mb-10">
        <p className="text-2xl font-light text-gray-500">
          WHY <span className="text-gray-800 font-semibold">CHOOSE US</span>
        </p>
        <div className="w-20 h-1 bg-[#5F6FFF] mx-auto mt-3 rounded"></div>
      </div>

      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 px-4">

        <div className="border border-gray-200 rounded-lg px-8 py-10 flex flex-col gap-4 text-sm text-gray-600 hover:bg-[#5F6FFF] hover:text-white transition-all duration-300 cursor-pointer shadow-sm">
          <b className="text-lg">Efficiency</b>
          <p>Streamlined appointment scheduling that fits perfectly into your busy lifestyle.</p>
        </div>

        <div className="border border-gray-200 rounded-lg px-8 py-10 flex flex-col gap-4 text-sm text-gray-600 hover:bg-[#5F6FFF] hover:text-white transition-all duration-300 cursor-pointer shadow-sm">
          <b className="text-lg">Convenience</b>
          <p>Access a trusted network of healthcare professionals near you.</p>
        </div>

        <div className="border border-gray-200 rounded-lg px-8 py-10 flex flex-col gap-4 text-sm text-gray-600 hover:bg-[#5F6FFF] hover:text-white transition-all duration-300 cursor-pointer shadow-sm">
          <b className="text-lg">Personalization</b>
          <p>Smart reminders and tailored recommendations to keep you on track.</p>
        </div>

      </div>
    </div>
  )
}

export default About
