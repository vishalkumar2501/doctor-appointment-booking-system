import React, { useContext } from 'react'
import {AppContext} from '../context/AppContext'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import FeedbackModal from '../components/FeedbackModal'

const MyAppointments = () => {

  const {backendUrl, token, getDoctorsData} = useContext(AppContext)
  const [showPayment, setShowPayment] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [feedbackTargetAppointment, setFeedbackTargetAppointment] = useState(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [cancelLoadingId, setCancelLoadingId] = useState(null)
  const [paymentLoadingId, setPaymentLoadingId] = useState(null)

  const months = [' ', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_')
    return dateArray[0] + ' ' + months[Number(dateArray[1])] + ' ' + dateArray[2]
  }

  const getUserAppointments = async() => {
    try{
      const {data} = await axios.get(backendUrl + '/api/user/appointments', {headers:{token}})

      if(data.success){
        setAppointments(data.appointments.reverse())
      }
    }
    catch(error){
      console.log(error)
      if (error.response?.status !== 401) {
        toast.error(error.message)
      }
    }
  }

  const handleGiveFeedbackClick = (appt) => {
    setFeedbackTargetAppointment(appt)
    setIsFeedbackModalOpen(true)
  }

  const handleFeedbackSubmit = async ({ rating, comment }) => {
    if (!feedbackTargetAppointment) return

    try {
      setFeedbackLoading(true)
      const payload = {
        appointmentId: feedbackTargetAppointment._id,
        doctorId: feedbackTargetAppointment.docId,
        rating,
        comment
      }

      const { data } = await axios.post(
        `${backendUrl}/api/user/feedback`,
        payload,
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message || "Feedback submitted successfully.")
        setIsFeedbackModalOpen(false)
        await getUserAppointments()
      } else {
        toast.error(data.message || "Failed to submit feedback.")
      }
    } catch (error) {
      console.error(error)
      if (error.response?.status !== 401) {
        const errMsg = error.response?.data?.message || error.message
        toast.error(errMsg || "Error submitting feedback.")
      }
    } finally {
      setFeedbackLoading(false)
    }
  }

  const cancelAppointment = async(appointmentId) => {
    if (cancelLoadingId || paymentLoadingId) return
    try{
      setCancelLoadingId(appointmentId)
      const {data} = await axios.post(backendUrl + '/api/user/cancel-appointment', {appointmentId}, {headers:{token}})

      if(data.success){
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      }
      else{
        toast.error(data.message)
      }
    }
    catch(error){
      console.log(error)
      if (error.response?.status !== 401) {
        toast.error(error.message)
      }
    } finally {
      setCancelLoadingId(null)
    }
  }


  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const payOnline = async (appointmentId) => {
    if (paymentLoadingId || cancelLoadingId) return
    try {
      setPaymentLoadingId(appointmentId)
      const isScriptLoaded = await loadRazorpayScript()
      if (!isScriptLoaded) {
        toast.error("Razorpay SDK failed to load. Please check your internet connection.")
        return
      }

      // Initiate order creation on backend
      const { data } = await axios.post(
        `${backendUrl}/api/user/payment/create-order`,
        { appointmentId },
        { headers: { token } }
      )

      if (!data.success) {
        toast.error(data.message || "Failed to initiate payment order.")
        return
      }

      // Setup Razorpay Checkout options
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "DocBook consultation",
        description: `Consultation with ${data.doctorName}`,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verifyPayload = {
              appointmentId: data.appointmentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }

            const verifyRes = await axios.post(
              `${backendUrl}/api/user/payment/verify`,
              verifyPayload,
              { headers: { token } }
            )

            if (verifyRes.data.success) {
              toast.success(verifyRes.data.message || "Payment successful!")
              getUserAppointments()
            } else {
              toast.error(verifyRes.data.message || "Payment verification failed.")
            }
          } catch (err) {
            console.error("Payment verification failed:", err)
            if (err.response?.status !== 401) {
              const errMsg = err.response?.data?.message || err.message
              toast.error(errMsg || "Error verifying transaction.")
            }
          }
        },
        prefill: {
          name: "",
          email: ""
        },
        theme: {
          color: "#5F6FFF"
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment checkout cancelled by user.")
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (error) {
      console.error("Payment initiation error:", error)
      if (error.response?.status !== 401) {
        const errMsg = error.response?.data?.message || error.message
        toast.error(errMsg || "Error initiating payment.")
      }
    } finally {
      setPaymentLoadingId(null)
    }
  }

  useEffect(() => {
    if(token){
      getUserAppointments()
    }
  }, [token])


  return (
    <div>
        <p className='pb-3 mt-12 font-medium text-zinc-700 border-b border-gray-400'>
          My appointments
        </p>

        <div>
          {
            appointments.map((item, index) => (
              <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 py-4 border-b border-gray-400 items-center sm:items-start' key={index}>
                <div className='w-full flex justify-center sm:block sm:w-auto flex-shrink-0'>
                  <img className='w-36 h-36 sm:w-32 sm:h-auto object-cover bg-indigo-50 rounded-lg mx-auto sm:mx-0'
                      src={item.docData.image} alt=''
                  />
                </div>

                <div className='flex-1 text-sm text-zinc-600 text-center sm:text-left w-full'>
                  <p className='text-neutral-800 font-semibold text-base sm:text-sm'>{item.docData.name}</p>
                  <p>{item.docData.speciality}</p>
                  <p className='text-zinc-700 font-medium mt-2 sm:mt-1'>📍 Appointment Location:</p>
                  {(() => {
                      const hasLoc = item.appointmentLocation && (item.appointmentLocation.line1 || item.appointmentLocation.line2 || item.appointmentLocation.city);
                      const hasDocDataAdd = item.docData?.address && (item.docData.address.line1 || item.docData.address.line2 || item.docData.city);
                      
                      if (hasLoc) {
                          return (
                              <>
                                  {item.appointmentLocation.line1 && <p className='text-xs'>{item.appointmentLocation.line1}</p>}
                                  {item.appointmentLocation.line2 && <p className='text-xs'>{item.appointmentLocation.line2}</p>}
                                  {item.appointmentLocation.city && <p className='text-xs'>{item.appointmentLocation.city}</p>}
                              </>
                          );
                      } else if (hasDocDataAdd) {
                          return (
                              <>
                                  {item.docData.address.line1 && <p className='text-xs'>{item.docData.address.line1}</p>}
                                  {item.docData.address.line2 && <p className='text-xs'>{item.docData.address.line2}</p>}
                                  {item.docData.city && <p className='text-xs'>{item.docData.city}</p>}
                              </>
                          );
                      } else {
                          return <p className='text-xs italic text-gray-400'>Location information unavailable.</p>;
                      }
                  })()}
                  <p className='text-xs mt-2 sm:mt-1'>
                    <span className='text-sm text-neutral-700 font-medium block sm:inline'>Date & Time: </span> 
                    {slotDateFormat(item.slotDate)} | {item.slotTime}
                  </p>
                </div>

                <div>
                </div>

                <div className='flex flex-col gap-2 justify-end w-full sm:w-auto'>
                  {
                    !item.cancelled && item.payment && !item.isCompleted && <button className='w-full sm:w-48 py-2.5 border rounded text-stone-500 bg-indigo-50 font-medium text-center text-sm'>Paid</button>
                  }
                  {
                    !item.cancelled && !item.payment && !item.isCompleted &&
                    <button disabled={paymentLoadingId !== null || cancelLoadingId !== null} onClick={() => payOnline(item._id)} className={`text-sm text-stone-500 text-center w-full sm:w-48 py-2.5 border rounded hover:bg-[#5F6FFF] hover:text-white transition-all duration-300 font-medium ${(paymentLoadingId !== null || cancelLoadingId !== null) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}>
                      {paymentLoadingId === item._id ? 'Processing...' : 'Pay Online'}
                    </button>
                  }
                  {
                    !item.cancelled && !item.isCompleted &&
                    <button disabled={cancelLoadingId !== null || paymentLoadingId !== null} onClick={() => cancelAppointment(item._id)} className={`text-sm text-stone-500 text-center w-full sm:w-48 py-2.5 border rounded hover:bg-red-500 hover:text-white transition-all duration-300 font-medium ${(cancelLoadingId !== null || paymentLoadingId !== null) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}>
                      {cancelLoadingId === item._id ? 'Cancelling...' : 'Cancel appointment'}
                    </button>
                  }

                  {
                    item.cancelled && !item.isCompleted &&
                    <div className='flex flex-col gap-1 items-center sm:items-end'>
                      <button className='w-full sm:w-48 py-2.5 border border-red-500 rounded text-red-500 text-center text-sm font-medium'>
                        Appointment cancelled
                      </button>
                      <div className='text-xs font-semibold text-stone-500 mt-1 text-center sm:text-right w-full sm:w-48'>
                        {
                          (item.payment || item.paymentStatus === 'Paid') ? (
                            <>
                              {item.refundStatus === 'Initiated' && (
                                <span className='text-blue-500 block font-bold'>Refund Processing</span>
                              )}
                              {item.refundStatus === 'Processed' && (
                                <span className='text-green-600 block font-bold'>Refund Completed</span>
                              )}
                              {item.refundStatus === 'Failed' && (
                                <span className='text-red-500 block font-bold'>Refund Failed</span>
                              )}
                              {item.refundStatus === 'None' && (
                                <span className='text-stone-500 block font-bold'>No Refund</span>
                              )}
                              {item.refundAmount > 0 && (item.refundStatus === 'Initiated' || item.refundStatus === 'Processed') && (
                                <span className='text-zinc-700 block font-semibold mt-0.5'>Refund Amount: ₹{item.refundAmount}</span>
                              )}
                              {item.refundReason && (item.refundStatus === 'None' || item.refundStatus === 'Failed') && (
                                <span className='text-zinc-400 block font-normal italic text-[11px] mt-0.5'>{item.refundReason}</span>
                              )}
                            </>
                          ) : (
                            <span className='text-stone-500 block font-bold'>No Refund</span>
                          )
                        }
                      </div>
                    </div>
                  }
                  {
                    item.isCompleted && <button className='w-full sm:w-48 py-2.5 border border-green-500 rounded text-green-500 text-center text-sm font-medium'>Completed</button>
                  }
                  {
                    item.isCompleted && !item.cancelled && !item.hasFeedback && (
                      <button
                        onClick={() => handleGiveFeedbackClick(item)}
                        className='w-full sm:w-48 py-2.5 border border-[#5F6FFF] text-[#5F6FFF] hover:bg-[#5F6FFF] hover:text-white rounded transition-all duration-300 font-medium text-center text-sm'
                      >
                        Give Feedback
                      </button>
                    )
                  }
                </div>
              </div>
            ))
          }
        </div>


        {/* ----- Feedback Modal ----- */}
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          onSubmit={handleFeedbackSubmit}
          loading={feedbackLoading}
          doctorName={feedbackTargetAppointment?.docData?.name || ''}
        />

    </div>
  )
}

export default MyAppointments