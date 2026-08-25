import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorAvailability = () => {
  const { dToken, backendUrl } = useContext(DoctorContext)
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Default skeleton configuration for 7 days
  const defaultDays = [
    { day: 'Monday', isWorking: false, startTime: '09:00', endTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00', hasLunch: false },
    { day: 'Tuesday', isWorking: false, startTime: '09:00', endTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00', hasLunch: false },
    { day: 'Wednesday', isWorking: false, startTime: '09:00', endTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00', hasLunch: false },
    { day: 'Thursday', isWorking: false, startTime: '09:00', endTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00', hasLunch: false },
    { day: 'Friday', isWorking: false, startTime: '09:00', endTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00', hasLunch: false },
    { day: 'Saturday', isWorking: false, startTime: '09:00', endTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00', hasLunch: false },
    { day: 'Sunday', isWorking: false, startTime: '09:00', endTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00', hasLunch: false }
  ]

  const [schedule, setSchedule] = useState(defaultDays)

  // Fetch availability on mount
  const fetchAvailability = async () => {
    try {
      setFetching(true)
      const { data } = await axios.get(backendUrl + '/api/doctor/profile/availability', {
        headers: { token: dToken }
      })

      if (data.success && data.availability) {
        const savedDays = data.availability.workingDays || []
        const updatedSchedule = defaultDays.map(d => {
          const saved = savedDays.find(s => s.day === d.day)
          if (saved) {
            return {
              ...d,
              isWorking: saved.isWorking,
              startTime: saved.startTime || '09:00',
              endTime: saved.endTime || '17:00',
              lunchStart: saved.lunchStart || '12:00',
              lunchEnd: saved.lunchEnd || '13:00',
              hasLunch: !!(saved.lunchStart && saved.lunchEnd)
            }
          }
          return d
        })
        setSchedule(updatedSchedule)
      } else {
        toast.info("No availability configured yet. Setting up default empty schedule.")
      }
    } catch (error) {
      console.error(error)
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Failed to fetch availability.")
      }
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (dToken) {
      fetchAvailability()
    }
  }, [dToken])

  // Helper to convert time "HH:MM" to minutes for validations
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0
    const [h, m] = timeStr.split(':').map(Number)
    return h * 60 + m
  }

  // Toggle isWorking status for a day
  const handleDayToggle = (index) => {
    setSchedule(prev => prev.map((item, idx) => 
      idx === index ? { ...item, isWorking: !item.isWorking } : item
    ))
  }

  // Update specific fields of a day schedule
  const handleFieldChange = (index, field, value) => {
    setSchedule(prev => prev.map((item, idx) => 
      idx === index ? { ...item, [field]: value } : item
    ))
  }

  // Toggle Lunch Break configuration for a day
  const handleLunchToggle = (index) => {
    setSchedule(prev => prev.map((item, idx) => 
      idx === index ? { ...item, hasLunch: !item.hasLunch } : item
    ))
  }

  // Save/Update availability
  const saveAvailability = async (e) => {
    e.preventDefault()

    // Frontend validations
    for (const dayConfig of schedule) {
      if (dayConfig.isWorking) {
        const start = timeToMinutes(dayConfig.startTime)
        const end = timeToMinutes(dayConfig.endTime)

        if (start >= end) {
          toast.error(`Invalid working hours for ${dayConfig.day}: Start time must be before End time.`)
          return
        }

        if (dayConfig.hasLunch) {
          const lunchStart = timeToMinutes(dayConfig.lunchStart)
          const lunchEnd = timeToMinutes(dayConfig.lunchEnd)

          if (lunchStart >= lunchEnd) {
            toast.error(`Invalid lunch hours for ${dayConfig.day}: Lunch Start must be before Lunch End.`)
            return
          }

          if (!(start < lunchStart && lunchStart < lunchEnd && lunchEnd < end)) {
            toast.error(`Chronology error for ${dayConfig.day}: Working hours must satisfy Start < Lunch Start < Lunch End < End.`)
            return
          }
        }
      }
    }

    try {
      setLoading(true)

      const payload = {
        slotDuration: 30, // Fixed 30 minutes
        workingDays: schedule
          .filter(d => d.isWorking)
          .map(({ day, isWorking, startTime, endTime, lunchStart, lunchEnd, hasLunch }) => {
            const dayData = { 
              day, 
              isWorking: true,
              startTime,
              endTime
            }
            if (hasLunch && lunchStart && lunchEnd) {
              dayData.lunchStart = lunchStart
              dayData.lunchEnd = lunchEnd
            }
            return dayData
          })
      }

      const { data } = await axios.post(
        backendUrl + '/api/doctor/profile/availability', 
        payload, 
        { headers: { token: dToken } }
      )

      if (data.success) {
        toast.success(data.message || "Availability updated successfully.")
        fetchAvailability()
      } else {
        toast.error(data.message || "Failed to update availability.")
      }
    } catch (error) {
      console.error(error)
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Server error occurred while saving.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className='flex justify-center items-center min-h-[60vh] w-full'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F6FFF]'></div>
      </div>
    )
  }

  return (
    <div className='max-w-4xl'>
      <div className='bg-white p-6 sm:p-8 rounded-lg border border-stone-100 shadow-sm'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-6 gap-4'>
          <div>
            <h2 className='text-2xl font-semibold text-neutral-800'>Manage Availability</h2>
            <p className='text-sm text-gray-500 mt-1'>Configure your weekly working schedule and rest periods.</p>
          </div>
          <div className='bg-[#F2F3FF] border border-[#5F6FFF]/30 px-3 py-1.5 rounded-full text-xs font-semibold text-[#5F6FFF] whitespace-nowrap'>
            Slot Duration: 30 Min (Fixed)
          </div>
        </div>
 
        <form onSubmit={saveAvailability} className='space-y-6'>
          <div className='space-y-4'>
            {schedule.map((item, index) => (
              <div 
                key={item.day} 
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  item.isWorking 
                    ? 'border-[#5F6FFF]/20 bg-[#F2F3FF]/10' 
                    : 'border-stone-100 bg-white opacity-70'
                }`}
              >
                {/* Day Header and Toggle */}
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                  <div className='flex items-center gap-3'>
                    <input 
                      type='checkbox' 
                      id={`day-checkbox-${item.day}`} 
                      checked={item.isWorking}
                      onChange={() => handleDayToggle(index)}
                      className='w-5 h-5 accent-[#5F6FFF] cursor-pointer rounded border-gray-300 focus:ring-[#5F6FFF]'
                    />
                    <label 
                      htmlFor={`day-checkbox-${item.day}`}
                      className={`text-base font-semibold cursor-pointer select-none ${
                        item.isWorking ? 'text-neutral-800' : 'text-neutral-500'
                      }`}
                    >
                      {item.day}
                    </label>
                  </div>
 
                  {item.isWorking && (
                    <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-600 w-full sm:w-auto'>
                      {/* Hours selection */}
                      <div className='flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto'>
                        <span className='text-xs text-gray-500 font-medium sm:hidden'>Shift Start:</span>
                        <input 
                          type='time' 
                          value={item.startTime}
                          onChange={(e) => handleFieldChange(index, 'startTime', e.target.value)}
                          className='w-full sm:w-auto px-2.5 py-1.5 border border-stone-200 rounded-lg focus:outline-none focus:border-[#5F6FFF] font-medium text-gray-700 bg-white'
                        />
                        <span className='text-xs text-gray-400 block text-center sm:inline sm:text-left'>
                            <span className='hidden sm:inline'>to</span>
                            <span className='sm:hidden'>↓</span>
                        </span>
                        <span className='text-xs text-gray-500 font-medium sm:hidden'>Shift End:</span>
                        <input 
                          type='time' 
                          value={item.endTime}
                          onChange={(e) => handleFieldChange(index, 'endTime', e.target.value)}
                          className='w-full sm:w-auto px-2.5 py-1.5 border border-stone-200 rounded-lg focus:outline-none focus:border-[#5F6FFF] font-medium text-gray-700 bg-white'
                        />
                      </div>
 
                      {/* Lunch toggle and selector */}
                      <div className='flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-gray-200 pt-3 sm:pt-0 pl-0 sm:pl-6 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-start'>
                        <div className='flex items-center gap-2'>
                          <input 
                            type='checkbox' 
                            id={`lunch-checkbox-${item.day}`} 
                            checked={item.hasLunch}
                            onChange={() => handleLunchToggle(index)}
                            className='w-4 h-4 accent-[#5F6FFF] cursor-pointer rounded'
                          />
                          <label 
                            htmlFor={`lunch-checkbox-${item.day}`}
                            className='text-xs font-semibold cursor-pointer text-gray-500 select-none'
                          >
                            Lunch Break
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
 
                {/* Optional Lunch Time Pickers */}
                {item.isWorking && item.hasLunch && (
                  <div className='mt-4 pt-3 border-t border-dashed border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 text-sm pl-0 sm:pl-8 w-full'>
                    <span className='text-xs text-gray-500 font-medium text-center sm:text-left'>Lunch Break Hours:</span>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto'>
                      <span className='text-xs text-gray-500 font-medium sm:hidden'>Lunch Start:</span>
                      <input 
                        type='time' 
                        value={item.lunchStart}
                        onChange={(e) => handleFieldChange(index, 'lunchStart', e.target.value)}
                        className='w-full sm:w-auto px-2.5 py-1.5 border border-stone-200 rounded-lg focus:outline-none focus:border-[#5F6FFF] font-medium text-gray-700 bg-white'
                      />
                      <span className='text-xs text-gray-400 block text-center sm:inline sm:text-left'>
                          <span className='hidden sm:inline'>to</span>
                          <span className='sm:hidden'>↓</span>
                      </span>
                      <span className='text-xs text-gray-500 font-medium sm:hidden'>Lunch End:</span>
                      <input 
                        type='time' 
                        value={item.lunchEnd}
                        onChange={(e) => handleFieldChange(index, 'lunchEnd', e.target.value)}
                        className='w-full sm:w-auto px-2.5 py-1.5 border border-stone-200 rounded-lg focus:outline-none focus:border-[#5F6FFF] font-medium text-gray-700 bg-white'
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action button */}
          <div className='pt-4 border-t border-gray-100 flex justify-end'>
            <button 
              type='submit' 
              disabled={loading}
              className={`w-full sm:w-auto px-10 py-3 text-white text-sm font-semibold rounded-lg bg-[#5F6FFF] hover:bg-[#5F6FFF]/90 transition-all cursor-pointer flex justify-center items-center gap-2 ${
                loading ? 'opacity-65 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  Saving...
                </>
              ) : (
                'Save Availability'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DoctorAvailability
