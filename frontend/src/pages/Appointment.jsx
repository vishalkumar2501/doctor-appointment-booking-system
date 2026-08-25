import React, { useState, useContext, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import DoctorReviews, { StarDisplay } from '../components/DoctorReviews'
import { toast } from 'react-toastify'
import axios from 'axios'

const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

/**
 * Converts a 24h time string (e.g. "14:30") to a user-friendly 12h display (e.g. "2:30 PM")
 */
const formatDisplayTime = (time24) => {
    if (!time24) return ''
    const [h, m] = time24.split(':').map(Number)
    const period = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 || 12
    return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

/**
 * Builds a D_M_YYYY date string from a JavaScript Date object (backend format)
 */
const toSlotDate = (date) => `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`

/**
 * Returns an array of the next 7 Date objects starting from today
 */
const buildNextSevenDays = () => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today)
        d.setDate(today.getDate() + i)
        d.setHours(0, 0, 0, 0)
        return d
    })
}

const Appointment = () => {
    const { docId } = useParams()
    const navigate = useNavigate()
    const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)

    const [docInfo, setDocInfo] = useState(null)

    // The 7 selectable days
    const [days, setDays] = useState([])
    const [selectedDayIndex, setSelectedDayIndex] = useState(0)

    // Slots returned from backend for selected day
    const [availableSlots, setAvailableSlots] = useState([])
    const [slotsLoading, setSlotsLoading] = useState(false)

    // The slot object the user picked — stores backend-format { startTime, endTime }
    const [selectedSlot, setSelectedSlot] = useState(null)

    // -------------------------------------------------------
    // Resolve doctor info from context
    // -------------------------------------------------------
    useEffect(() => {
        const found = doctors.find(doc => doc._id === docId)
        setDocInfo(found || null)
    }, [doctors, docId])

    // -------------------------------------------------------
    // Build next 7 days on mount and restore saved date selection
    // -------------------------------------------------------
    useEffect(() => {
        const nextSeven = buildNextSevenDays()
        setDays(nextSeven)

        const savedDateStr = localStorage.getItem(`booking_date_${docId}`)
        if (savedDateStr) {
            const matchedIndex = nextSeven.findIndex(d => toSlotDate(d) === savedDateStr)
            if (matchedIndex !== -1) {
                setSelectedDayIndex(matchedIndex)
            }
        }
    }, [docId])

    // Persist selected date index whenever it changes
    useEffect(() => {
        if (days.length > 0 && days[selectedDayIndex]) {
            const dateStr = toSlotDate(days[selectedDayIndex])
            localStorage.setItem(`booking_date_${docId}`, dateStr)
        }
    }, [selectedDayIndex, days, docId])

    // Persist selected slot whenever it changes
    useEffect(() => {
        if (selectedSlot) {
            localStorage.setItem(`booking_slot_${docId}`, selectedSlot.startTime)
        } else {
            localStorage.removeItem(`booking_slot_${docId}`)
        }
    }, [selectedSlot, docId])

    // -------------------------------------------------------
    // Fetch available slots from backend whenever day changes
    // -------------------------------------------------------
    useEffect(() => {
        if (!docId || days.length === 0) return
        fetchSlots(days[selectedDayIndex])
    }, [selectedDayIndex, days, docId])

    const fetchSlots = async (date) => {
        setAvailableSlots([])
        setSlotsLoading(true)

        const appointmentDate = toSlotDate(date)

        try {
            const { data } = await axios.get(
                `${backendUrl}/api/user/doctor/${docId}/slots`,
                { params: { appointmentDate } }
            )

            if (data.success) {
                const slots = data.availableSlots || []
                setAvailableSlots(slots)

                // Restore previously selected slot if it still exists in available slots
                const savedSlotTime = localStorage.getItem(`booking_slot_${docId}`)
                if (savedSlotTime) {
                    const matchedSlot = slots.find(s => s.startTime === savedSlotTime)
                    if (matchedSlot) {
                        setSelectedSlot(matchedSlot)
                    } else {
                        setSelectedSlot(null)
                        localStorage.removeItem(`booking_slot_${docId}`)
                    }
                } else {
                    setSelectedSlot(null)
                }
            } else {
                setAvailableSlots([])
                setSelectedSlot(null)
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message
            // Show info toast for "unavailable on this day", not an error
            if (msg && msg.toLowerCase().includes('unavailable')) {
                toast.info(msg)
            } else if (msg) {
                toast.error(msg)
            }
            setAvailableSlots([])
            setSelectedSlot(null)
        } finally {
            setSlotsLoading(false)
        }
    }

    // -------------------------------------------------------
    // Book appointment
    // -------------------------------------------------------
    const bookAppointment = async () => {
        if (!token) {
            toast.warn('Login to book appointment')
            return navigate('/login')
        }

        if (!selectedSlot) {
            toast.warn('Please select a time slot')
            return
        }

        try {
            const slotDate = toSlotDate(days[selectedDayIndex])

            // slotTime must be the 24h startTime exactly as returned by the backend
            const { data } = await axios.post(
                backendUrl + '/api/user/book-appointment',
                { docId, slotDate, slotTime: selectedSlot.startTime },
                { headers: { token } }
            )

            if (data.success) {
                toast.success(data.message)
                localStorage.removeItem(`booking_date_${docId}`)
                localStorage.removeItem(`booking_slot_${docId}`)
                getDoctorsData()
                navigate('/my-appointments')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            if (error.response?.status !== 401) {
                toast.error(error.message)
            }
        }
    }

    // -------------------------------------------------------
    // Handle day tab change
    // -------------------------------------------------------
    const handleDaySelect = (index) => {
        setSelectedDayIndex(index)
    }

    return docInfo && (
        <div>
            {/* ------ Doctor Details & Booking & Reviews Container ------ */}
            <div className='flex flex-col sm:flex-row gap-4 items-start'>
                {/* ------ Doctor Image (Left) ------ */}
                <div className='w-full sm:w-72 flex justify-center sm:block flex-shrink-0'>
                    <img className='bg-[#5F6FFF] w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt='' />
                </div>

                {/* ------ Doctor Info & Booking Slots & Reviews (Right) ------ */}
                <div className='flex-1 w-full'>
                    {/* ------ Doctor Info Card ------ */}
                    <div className='border border-gray-400 rounded-lg p-8 py-7 bg-white mx-0 sm:mx-0 mt-0 sm:mt-0 w-full'>
                        {/* ------ Doc Info : name, degree, experience ------ */}
                        <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
                            {docInfo.name}
                            <img className='w-5' src={assets.verified_icon} alt='' />
                        </p>

                        <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
                            <p>{docInfo.degree} - {docInfo.speciality}</p>
                            <button className='py-0.5 px-2 border text-xs rounded-full cursor-pointer'>{docInfo.experience}</button>
                        </div>

                        <div className='flex items-center gap-1.5 mt-2'>
                            <StarDisplay rating={docInfo.averageRating || 0} />
                            <span className='text-xs text-gray-500 font-medium'>
                                ({docInfo.totalReviews || 0} {docInfo.totalReviews === 1 ? 'review' : 'reviews'})
                            </span>
                        </div>

                        {/* ------ Doctor About ------ */}
                        <div>
                            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
                                About
                                <img src={assets.info_icon} alt='' />
                            </p>
                            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
                        </div>

                        {/* ------ Clinic / Hospital Location ------ */}
                        <div className='mt-3'>
                            <p className='flex items-center gap-1 text-sm font-medium text-gray-900'>
                                📍 Clinic / Hospital Location
                            </p>
                            {!docInfo.address || (!docInfo.address.line1 && !docInfo.address.line2 && !docInfo.city) ? (
                                <p className='text-sm text-gray-500 mt-1 pl-4 leading-tight'>
                                    Location information unavailable.
                                </p>
                            ) : (
                                <p className='text-sm text-gray-500 mt-1 pl-4 leading-tight'>
                                    {docInfo.address.line1 && <>{docInfo.address.line1}<br/></>}
                                    {docInfo.address.line2 && <>{docInfo.address.line2}<br/></>}
                                    {docInfo.city && <>{docInfo.city}</>}
                                </p>
                            )}
                        </div>

                        <p className='text-gray-500 font-medium mt-4'>
                            Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
                        </p>
                    </div>

                    {/* ------ Booking slots ------ */}
                    <div className='mt-8 sm:mt-6 font-medium text-gray-700 w-full'>
                        <p>Booking slots</p>

                        {/* Day selector */}
                        <div className='flex gap-3 items-center w-full overflow-x-auto mt-4 pb-2'>
                            {days.map((date, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleDaySelect(index)}
                                    className={`text-center py-6 min-w-16 rounded-full cursor-pointer flex-shrink-0 transition-all duration-300 ${selectedDayIndex === index ? 'bg-[#5F6FFF] text-white border-[#5F6FFF]' : 'border border-gray-200 text-gray-500'}`}
                                >
                                    <p>{daysOfWeek[date.getDay()]}</p>
                                    <p>{date.getDate()}</p>
                                </div>
                            ))}
                        </div>

                        {/* Time slot grid */}
                        <div className='flex flex-wrap items-center gap-3 w-full mt-4 min-h-[48px]'>
                            {slotsLoading ? (
                                <p className='text-sm text-gray-400'>Loading slots...</p>
                            ) : availableSlots.length === 0 ? (
                                <p className='text-sm text-gray-400'>No available slots on this day.</p>
                            ) : (
                                availableSlots.map((slot, index) => {
                                    const isSelected = selectedSlot && selectedSlot.startTime === slot.startTime
                                    return (
                                        <p
                                            key={index}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer transition-all duration-300 ${isSelected ? 'bg-[#5F6FFF] text-white border-[#5F6FFF]' : 'text-gray-400 border border-gray-300'}`}
                                        >
                                            {formatDisplayTime(slot.startTime)}
                                        </p>
                                    )
                                })
                            )}
                        </div>

                        <button onClick={bookAppointment} className='w-full sm:w-auto bg-[#5F6FFF] text-white text-sm font-light px-14 py-3 rounded-full my-6 cursor-pointer block text-center transition-all duration-300'>
                            Book an appointment
                        </button>
                    </div>

                    {/* ------ Doctor Reviews ------ */}
                    <div className='mt-6 w-full'>
                        <DoctorReviews
                            doctorId={docId}
                            backendUrl={backendUrl}
                            averageRating={docInfo.averageRating || 0}
                            totalReviews={docInfo.totalReviews || 0}
                        />
                    </div>
                </div>
            </div>

            {/* ------ Listing Related Doctors ------ */}
            <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
        </div>
    )
}

export default Appointment