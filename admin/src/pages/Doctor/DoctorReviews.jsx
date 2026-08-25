import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'
 
/**
 * StarDisplay Component: Renders 5 star icons representing the review rating.
 */
const StarDisplay = ({ rating, size = 'text-sm' }) => {
  const stars = []
  const roundedRating = Math.round(rating)
 
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={`${size} ${i <= roundedRating ? 'text-amber-400' : 'text-gray-200'}`}
      >
        ★
      </span>
    )
  }
 
  return <div className='flex gap-0.5'>{stars}</div>
}
 
/**
 * RatingSummary Component: Displays aggregated average ratings and review counts.
 */
const RatingSummary = ({ averageRating, totalReviews }) => {
  return (
    <div className='flex flex-col sm:flex-row items-center gap-4 bg-white p-5 border border-stone-100 rounded-lg shadow-sm w-full sm:max-w-md'>
      <div className='text-center border-b sm:border-b-0 sm:border-r border-stone-100 pb-3 sm:pb-0 pr-0 sm:pr-5 w-full sm:w-auto'>
        <span className='text-4xl font-bold text-gray-800'>{averageRating ? Number(averageRating).toFixed(1) : '0.0'}</span>
        <span className='text-xs text-gray-400 block mt-1'>out of 5.0</span>
      </div>
      <div className='text-center sm:text-left w-full sm:w-auto'>
        <div className='flex justify-center sm:justify-start mb-1'>
          <StarDisplay rating={averageRating} size='text-xl' />
        </div>
        <span className='text-sm text-gray-500 font-medium'>
          Total: {totalReviews || 0} {totalReviews === 1 ? 'review' : 'reviews'}
        </span>
      </div>
    </div>
  )
}
 
/**
 * ReviewCard Component: Renders individual feedback comments and ratings.
 */
const ReviewCard = ({ review }) => {
  const patient = review.patientId || {}
  const patientName = patient.name || 'Anonymous Patient'
  const patientImage = patient.image
  const rating = review.rating || 0
  const comment = review.comment || ''
  const dateStr = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
 
  return (
    <div className='bg-white p-5 border border-stone-100 rounded-lg shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow duration-200 w-full'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3'>
        <div className='flex items-center gap-3 flex-1 min-w-0'>
          {patientImage ? (
            <img
              src={patientImage}
              alt={patientName}
              className='w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0'
            />
          ) : (
            <div className='w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 font-semibold flex items-center justify-center border border-indigo-100 text-sm shrink-0'>
              {patientName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className='min-w-0'>
            <p className='text-sm font-semibold text-gray-800 break-words'>{patientName}</p>
            <p className='text-xs text-gray-400 mt-0.5'>{dateStr}</p>
          </div>
        </div>
        <div className='mt-1 sm:mt-0 self-start sm:self-auto shrink-0'>
          <StarDisplay rating={rating} />
        </div>
      </div>
      {comment && (
        <p className='text-sm text-gray-600 leading-relaxed pl-1 break-words'>
          {comment}
        </p>
      )}
    </div>
  )
}
 
/**
 * DoctorReviews Component: Main page in the doctor dashboard displaying aggregated summaries
 * and review card lists for the logged-in doctor.
 */
const DoctorReviews = () => {
  const { dToken, profileData, getProfileData, backendUrl } = useContext(DoctorContext)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
 
  // Ensure profileData is populated
  useEffect(() => {
    if (dToken && !profileData) {
      getProfileData()
    }
  }, [dToken, profileData])
 
  // Fetch reviews using the public endpoint with docId
  useEffect(() => {
    let active = true
 
    const fetchDoctorReviews = async () => {
      const docId = profileData?._id
      if (!docId) return
 
      setLoading(true)
      setError('')
      try {
        const { data } = await axios.get(`${backendUrl}/api/doctor/${docId}/feedback`)
        if (active) {
          if (data.success) {
            setReviews(data.feedbacks || [])
          } else {
            setError(data.message || 'Failed to load reviews.')
          }
        }
      } catch (err) {
        if (active) {
          console.error(err)
          setError(err.response?.data?.message || err.message || 'Error fetching reviews.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }
 
    fetchDoctorReviews()
 
    return () => {
      active = false
    }
  }, [profileData?._id, backendUrl])
 
  return (
    <div className='max-w-4xl'>
      <div className='mb-5'>
        <p className='text-lg font-medium text-[#5F6FFF]'>Reviews & Ratings</p>
        <p className='text-sm text-gray-500 mt-1'>View star ratings and comments left by patients</p>
      </div>
 
      {profileData && (
        <div className='mb-6'>
          <RatingSummary
            averageRating={profileData.averageRating || 0}
            totalReviews={profileData.totalReviews || 0}
          />
        </div>
      )}
 
      {/* Review List Section */}
      <div className='w-full'>
        {loading ? (
          <div className='py-12 text-center text-gray-400'>Loading reviews...</div>
        ) : error ? (
          <div className='py-12 text-center text-red-500 font-semibold'>{error}</div>
        ) : reviews.length === 0 ? (
          <div className='py-16 px-4 text-center text-gray-400 bg-white border border-stone-150 rounded-xl shadow-sm max-w-md mx-auto'>
            No reviews submitted yet.
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1'>
            {reviews.map((rev) => (
              <ReviewCard key={rev._id} review={rev} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
 
export default DoctorReviews
