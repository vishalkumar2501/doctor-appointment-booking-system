import React, { useState, useEffect } from 'react'

/**
 * A reusable Star Rating selection component.
 */
const StarRating = ({ rating, onChange, disabled }) => {
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className='flex gap-2 justify-center items-center my-3'>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hoverRating || rating)
        return (
          <button
            key={star}
            type='button'
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => !disabled && setHoverRating(star)}
            onMouseLeave={() => !disabled && setHoverRating(0)}
            className={`text-3xl focus:outline-none transition-colors duration-150 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${
              active ? 'text-amber-400' : 'text-gray-200'
            }`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}

/**
 * A reusable Review Textarea with a character count validator.
 */
const ReviewTextarea = ({ value, onChange, disabled, maxLength = 1000 }) => {
  return (
    <div className='w-full text-left'>
      <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>
        Review Comments
      </label>
      <textarea
        rows={4}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder='Share your experience with the doctor...'
        className='w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#5F6FFF] disabled:bg-gray-50 disabled:text-gray-400 transition-all resize-none'
      />
      <div className='flex justify-between items-center text-xs text-gray-400 mt-1'>
        <span>Please write at least 3 characters.</span>
        <span className={value.length > maxLength ? 'text-red-500 font-semibold' : ''}>
          {value.length} / {maxLength}
        </span>
      </div>
    </div>
  )
}

/**
 * FeedbackModal Component for patients to rate and review completed appointments.
 */
const FeedbackModal = ({ isOpen, onClose, onSubmit, loading, doctorName }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [validationError, setValidationError] = useState('')

  // Reset inputs when modal toggled
  useEffect(() => {
    if (isOpen) {
      setRating(0)
      setComment('')
      setValidationError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleFormSubmit = (e) => {
    e.preventDefault()
    setValidationError('')

    if (!rating) {
      setValidationError('Please select a star rating.')
      return
    }

    if (!comment || comment.trim().length < 3) {
      setValidationError('Please write a review comment (minimum 3 characters).')
      return
    }

    if (comment.trim().length > 1000) {
      setValidationError('Review comments cannot exceed 1000 characters.')
      return
    }

    onSubmit({ rating, comment: comment.trim() })
  }

  return (
    <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in'>
      <div className='bg-white p-6 rounded-2xl w-full max-w-md shadow-xl transition-all duration-300 transform scale-100'>
        <div className='text-center'>
          <h2 className='text-xl font-bold text-gray-800 mb-1'>Give Feedback</h2>
          <p className='text-sm text-gray-500 mb-4'>
            How was your appointment with <span className='font-semibold text-[#5F6FFF]'>{doctorName}</span>?
          </p>

          <form onSubmit={handleFormSubmit} className='space-y-4'>
            {/* Star Rating Section */}
            <div>
              <span className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>
                Your Rating
              </span>
              <StarRating rating={rating} onChange={setRating} disabled={loading} />
            </div>

            {/* Comment Section */}
            <ReviewTextarea value={comment} onChange={setComment} disabled={loading} />

            {/* Validation Errors */}
            {validationError && (
              <p className='text-xs text-red-500 font-semibold text-left'>{validationError}</p>
            )}

            {/* Form Action Controls */}
            <div className='flex gap-3 pt-2'>
              <button
                type='button'
                disabled={loading}
                onClick={onClose}
                className='flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={loading || !rating || comment.trim().length < 3 || comment.trim().length > 1000}
                className='flex-1 bg-[#5F6FFF] text-white py-2.5 rounded-lg font-medium hover:bg-[#4b5cff] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2'
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default FeedbackModal
