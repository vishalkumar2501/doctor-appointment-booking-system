import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

/**
 * A reusable component to render stars based on a rating value.
 */
export const StarDisplay = ({ rating, size = 'text-sm' }) => {
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
 * Renders an individual review card.
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
    day: 'numeric',
  })

  return (
    <div className='bg-white p-4 border border-gray-150 rounded-xl shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow duration-200'>
      <div className='flex items-center gap-3'>
        {patientImage ? (
          <img
            src={patientImage}
            alt={patientName}
            className='w-9 h-9 rounded-full object-cover border border-gray-100'
          />
        ) : (
          <div className='w-9 h-9 rounded-full bg-indigo-50 text-indigo-500 font-semibold flex items-center justify-center text-sm border border-indigo-100'>
            {patientName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-semibold text-gray-800 truncate'>{patientName}</p>
          <p className='text-xs text-gray-400'>{dateStr}</p>
        </div>
        <StarDisplay rating={rating} />
      </div>
      {comment && (
        <p className='text-sm text-gray-600 leading-relaxed pl-1'>
          {comment}
        </p>
      )}
    </div>
  )
}

/**
 * DoctorReviews Component: Loads and displays rating statistics and patient review cards.
 */
const DoctorReviews = ({ doctorId, backendUrl, averageRating = 0, totalReviews = 0 }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReviews = async () => {
      if (!doctorId) return
      setLoading(true)
      setError('')
      try {
        const { data } = await axios.get(`${backendUrl}/api/doctor/${doctorId}/feedback`)
        if (data.success) {
          setReviews(data.feedbacks || [])
        } else {
          setError(data.message || 'Failed to load doctor reviews.')
        }
      } catch (err) {
        console.error(err)
        setError(err.response?.data?.message || err.message || 'Error loading doctor reviews.')
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [doctorId, backendUrl])

  return (
    <div className='mt-8 border-t border-gray-200 pt-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6'>
        <div>
          <h3 className='text-lg font-bold text-gray-800'>Patient Feedback & Reviews</h3>
          <p className='text-xs text-gray-400 mt-0.5'>Shared experiences from verified patients</p>
        </div>

        {/* Rating Summary Header */}
        <div className='flex items-center gap-3 bg-gray-50 border border-gray-150 px-4 py-2 rounded-xl self-start sm:self-auto'>
          <div className='text-center border-r border-gray-200 pr-3'>
            <span className='text-2xl font-bold text-gray-800'>{averageRating ? Number(averageRating).toFixed(1) : '0.0'}</span>
            <span className='text-xs text-gray-400 block'>out of 5</span>
          </div>
          <div>
            <StarDisplay rating={averageRating} size='text-base' />
            <span className='text-xs text-gray-500 block mt-0.5 font-medium'>
              {totalReviews || 0} {totalReviews === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      </div>

      {/* Reviews Content Grid */}
      {loading ? (
        <div className='py-8 text-center text-sm text-gray-400'>Loading patient reviews...</div>
      ) : error ? (
        <div className='py-8 text-center text-sm text-red-500 font-semibold'>{error}</div>
      ) : reviews.length === 0 ? (
        <div className='py-8 text-center text-sm text-gray-400 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl'>
          No patient reviews submitted for this doctor yet.
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1'>
          {reviews.map((rev) => (
            <ReviewCard key={rev._id} review={rev} />
          ))}
        </div>
      )}
    </div>
  )
}

export default DoctorReviews
