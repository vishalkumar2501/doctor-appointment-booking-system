import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'

// ==========================================
// REUSABLE SUB-COMPONENTS
// ==========================================

/**
 * Date and reason selector section component
 */
const DateSelector = ({ date, setDate, minDate, blockReason, setBlockReason, loadSlots, loading }) => {
  return (
    <div className='flex flex-col sm:flex-row sm:items-end gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100'>
      <div className='w-full sm:flex-1'>
        <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>Select Date</label>
        <input 
          type='date' 
          value={date}
          min={minDate}
          onChange={(e) => setDate(e.target.value)}
          className='w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#5F6FFF] font-medium text-gray-700 bg-white'
        />
      </div>
      <div className='w-full sm:flex-1'>
        <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>Reason for Block</label>
        <input 
          type='text' 
          value={blockReason}
          onChange={(e) => setBlockReason(e.target.value)}
          placeholder='e.g., Doctor unavailable'
          className='w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#5F6FFF] font-medium text-gray-700 bg-white'
        />
      </div>
      <button 
        onClick={loadSlots}
        disabled={loading}
        className='w-full sm:w-auto px-6 py-2.5 border border-[#5F6FFF] text-[#5F6FFF] font-semibold rounded-lg hover:bg-[#5F6FFF] hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center'
      >
        {loading ? 'Loading...' : 'Load Slots'}
      </button>
    </div>
  )
}
 
/**
 * Clickable time slot chip representation
 */
const SlotChip = ({ slot, isSelected, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full sm:w-auto p-3 rounded-lg border text-sm font-semibold transition-all cursor-pointer text-center select-none disabled:opacity-50 disabled:cursor-not-allowed flex-1 min-w-[120px] sm:flex-none ${
        isSelected 
          ? 'bg-[#5F6FFF] border-[#5F6FFF] text-white shadow-sm'
          : 'border-stone-200 bg-white text-gray-600 hover:border-[#5F6FFF] hover:text-[#5F6FFF]'
      }`}
    >
      {slot.startTime} - {slot.endTime}
    </button>
  )
}
 
/**
 * Display grid wrapper for active available slots
 */
const SlotGrid = ({ availableSlots, selectedSlots, toggleSlotSelection, loading }) => {
  if (availableSlots.length === 0) {
    return (
      <div className='text-sm text-gray-500 bg-gray-50 p-6 rounded-lg text-center border border-dashed border-gray-200 w-full'>
        No available slots found for this date. (The doctor may be unavailable or fully booked).
      </div>
    )
  }
 
  return (
    <div className='flex flex-wrap gap-3 w-full sm:grid sm:grid-cols-4'>
      {availableSlots.map(slot => {
        const isSelected = selectedSlots.some(s => s.startTime === slot.startTime)
        return (
          <SlotChip 
            key={slot.startTime}
            slot={slot}
            isSelected={isSelected}
            disabled={loading}
            onClick={() => toggleSlotSelection(slot)}
          />
        )
      })}
    </div>
  )
}
 
/**
 * Renders individual blocked schedule entries
 */
const BlockedSlotCard = ({ block, onUnblock, loading }) => {
  return (
    <div className='p-4 rounded-xl border border-red-100 bg-red-50/20 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 w-full'>
      <div className='text-center sm:text-left'>
        <p className='text-sm font-bold text-gray-700'>
          {block.slotStartTime} - {block.slotEndTime}
        </p>
        <p className='text-xs text-red-500 mt-1 italic font-medium'>
          Reason: {block.reason || 'None provided'}
        </p>
      </div>
      <button
        onClick={() => onUnblock(block._id)}
        disabled={loading}
        className='w-full sm:w-auto px-3.5 py-2.5 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all text-center'
      >
        Unblock
      </button>
    </div>
  )
}
 
/**
 * List layout wrapper for blocked slot items
 */
const BlockedSlotList = ({ blockedSlots, onUnblock, loading }) => {
  if (blockedSlots.length === 0) {
    return (
      <div className='text-sm text-gray-500 bg-gray-50 p-6 rounded-lg text-center border border-dashed border-gray-200 w-full'>
        No blocked slots registered for this date.
      </div>
    )
  }
 
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 w-full'>
      {blockedSlots.map(block => (
        <BlockedSlotCard 
          key={block._id}
          block={block}
          onUnblock={onUnblock}
          loading={loading}
        />
      ))}
    </div>
  )
}

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================

const DoctorBlockedSlots = () => {
  const { dToken, profileData, getProfileData, backendUrl } = useContext(DoctorContext)

  const [date, setDate] = useState(() => {
    return localStorage.getItem('doctor_selected_blocked_slots_date') || ''
  })
  const [loading, setLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])
  const [blockedSlots, setBlockedSlots] = useState([])
  const [selectedSlots, setSelectedSlots] = useState([])
  const [blockReason, setBlockReason] = useState('Doctor unavailable')
 
  // Load doctor profile if not already loaded to get docId
  useEffect(() => {
    if (dToken && !profileData) {
      getProfileData()
    }
  }, [dToken, profileData])
 
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Set default date to today or restore from localStorage on mount
  useEffect(() => {
    const storedDate = localStorage.getItem('doctor_selected_blocked_slots_date')
    const todayStr = getTodayString()
    if (storedDate && storedDate >= todayStr) {
      setDate(storedDate)
    } else {
      setDate(todayStr)
    }
  }, [])

  // Persist date to localStorage whenever it changes
  useEffect(() => {
    if (date) {
      localStorage.setItem('doctor_selected_blocked_slots_date', date)
    }
  }, [date])

  const getFormattedDate = (rawDate) => {
    if (!rawDate) return ''
    if (rawDate.includes('_')) {
      return rawDate
    }
    if (rawDate.includes('-')) {
      const [year, month, day] = rawDate.split('-')
      return `${parseInt(day)}_${parseInt(month)}_${year}`
    }
    return rawDate
  }

  // Load both available and blocked slots for selected date
  const loadSlots = async () => {
    if (!date) {
      toast.warn("Please select a date first.")
      return
    }
    const todayStr = getTodayString()
    if (date < todayStr) {
      toast.error("Past dates cannot be used for blocking slots.")
      return
    }
    if (!profileData?._id) {
      toast.error("Doctor profile not loaded yet. Please try again.")
      return
    }

    try {
      setLoading(true)
      const formattedDate = getFormattedDate(date)

      // Fetch available slots from public user endpoint
      const availableRes = await axios.get(
        `${backendUrl}/api/user/doctor/${profileData._id}/slots?appointmentDate=${formattedDate}`
      )

      // Fetch blocked slots from authenticated doctor endpoint
      const blockedRes = await axios.get(
        `${backendUrl}/api/doctor/blocked-slots?appointmentDate=${formattedDate}`,
        { headers: { token: dToken } }
      )

      if (availableRes.data.success) {
        setAvailableSlots(availableRes.data.availableSlots || [])
      } else {
        setAvailableSlots([])
        toast.error(availableRes.data.message || "Failed to load available slots.")
      }

      if (blockedRes.data.success) {
        setBlockedSlots(blockedRes.data.blockedSlots || [])
      } else {
        setBlockedSlots([])
        toast.error(blockedRes.data.message || "Failed to load blocked slots.")
      }

      setSelectedSlots([]) // Clear selections on load
    } catch (error) {
      console.error(error)
      if (error.response?.status !== 401) {
        const errMsg = error.response?.data?.message || error.message
        toast.error(errMsg || "Error loading schedule slots.")
      }
      setAvailableSlots([])
      setBlockedSlots([])
    } finally {
      setLoading(false)
    }
  }

  // Auto load slots when date changes or profile is loaded
  useEffect(() => {
    if (date && profileData?._id) {
      const todayStr = getTodayString()
      if (date >= todayStr) {
        loadSlots()
      } else {
        setAvailableSlots([])
        setBlockedSlots([])
      }
    }
  }, [date, profileData?._id])

  // Handle slot selection toggling
  const toggleSlotSelection = (slot) => {
    setSelectedSlots(prev => {
      const exists = prev.some(s => s.startTime === slot.startTime)
      if (exists) {
        return prev.filter(s => s.startTime !== slot.startTime)
      } else {
        return [...prev, slot]
      }
    })
  }

  // Block selected slots
  const handleBlockSlots = async () => {
    if (selectedSlots.length === 0) {
      toast.warn("Please select at least one time slot to block.")
      return
    }

    const todayStr = getTodayString()
    if (date < todayStr) {
      toast.error("Past dates cannot be used for blocking slots.")
      return
    }

    try {
      setLoading(true)
      const formattedDate = getFormattedDate(date)

      let successCount = 0
      let errors = []

      for (const s of selectedSlots) {
        try {
          const payload = {
            appointmentDate: formattedDate,
            slotStartTime: s.startTime,
            slotEndTime: s.endTime,
            reason: blockReason || "Doctor unavailable",
            blockedBy: "Doctor"
          }

          const { data } = await axios.post(
            `${backendUrl}/api/doctor/block-slot`,
            payload,
            { headers: { token: dToken } }
          )

          if (data.success) {
            successCount++
          } else {
            errors.push(data.message || `Failed to block slot ${s.startTime}.`)
          }
        } catch (err) {
          errors.push(err.response?.data?.message || err.message)
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} slot(s) successfully blocked.`)
      }
      if (errors.length > 0) {
        errors.forEach(err => toast.error(err))
      }

      setSelectedSlots([]) // Explicitly clear selected slots
      await loadSlots() // Refresh grids
    } catch (error) {
      console.error(error)
      if (error.response?.status !== 401) {
        toast.error(error.message || "Error blocking slots.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Unblock a previously blocked slot
  const handleUnblockSlot = async (blockId) => {
    try {
      setLoading(true)
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/unblock-slot/${blockId}`,
        {},
        { headers: { token: dToken } }
      )

      if (data.success) {
        toast.success(data.message || "Slot successfully unblocked.")
        await loadSlots() // Refresh grids
      } else {
        toast.error(data.message || "Failed to unblock slot.")
      }
    } catch (error) {
      console.error(error)
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Error unblocking slot.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='max-w-4xl'>
      <div className='bg-white p-6 sm:p-8 rounded-lg border border-stone-100 shadow-sm'>
        
        {/* Header Section */}
        <div className='border-b border-gray-100 pb-4 mb-6'>
          <h2 className='text-2xl font-semibold text-neutral-800'>Manage Blocked Slots</h2>
          <p className='text-sm text-gray-500 mt-1'>Temporarily block or unblock specific scheduling slots for a target date.</p>
        </div>

        {/* Date Selector component */}
        <DateSelector 
          date={date}
          setDate={setDate}
          minDate={getTodayString()}
          blockReason={blockReason}
          setBlockReason={setBlockReason}
          loadSlots={loadSlots}
          loading={loading}
        />

        {/* Loading Spinner */}
        {loading && availableSlots.length === 0 && blockedSlots.length === 0 && (
          <div className='flex justify-center items-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#5F6FFF]'></div>
          </div>
        )}

        <div className='space-y-8'>
          {/* Available Slots section */}
          <div>
            <h3 className='text-lg font-semibold text-neutral-800 mb-3 flex items-center gap-2'>
              Available Slots
              {selectedSlots.length > 0 && (
                <span className='bg-[#5F6FFF] text-white px-2 py-0.5 text-xs rounded-full font-medium animate-pulse'>
                  {selectedSlots.length} Selected
                </span>
              )}
            </h3>
            
            <SlotGrid 
              availableSlots={availableSlots}
              selectedSlots={selectedSlots}
              toggleSlotSelection={toggleSlotSelection}
              loading={loading}
            />

            {availableSlots.length > 0 && (
              <div className='mt-4 flex justify-end w-full'>
                <button
                  onClick={handleBlockSlots}
                  disabled={selectedSlots.length === 0 || loading}
                  className='w-full sm:w-auto px-6 py-2.5 bg-[#5F6FFF] text-white font-semibold rounded-lg hover:bg-[#5F6FFF]/95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center'
                >
                  {loading ? 'Blocking...' : 'Block Selected Slots'}
                </button>
              </div>
            )}
          </div>

          {/* Blocked Slots section */}
          <div className='border-t border-gray-100 pt-6'>
            <h3 className='text-lg font-semibold text-neutral-800 mb-3'>Blocked Slots</h3>
            <BlockedSlotList 
              blockedSlots={blockedSlots}
              onUnblock={handleUnblockSlot}
              loading={loading}
            />
          </div>
        </div>

      </div>
    </div>
  )
}

export default DoctorBlockedSlots
