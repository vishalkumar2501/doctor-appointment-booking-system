import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate, useLocation } from 'react-router-dom'

const Login = () => {

  const {backendUrl, token, setToken} = useContext(AppContext)
  const navigate = useNavigate()
  const location = useLocation()

  const [state, setState] = useState('Sign Up')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOtpScreen, setShowOtpScreen] = useState(false)
  const [otp, setOtp] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (location.state && location.state.mode) {
      setState(location.state.mode)
    }
  }, [location.state])

  useEffect(() => {
    setShowOtpScreen(false)
    setOtp('')
    setConfirmPassword('')
    setForgotPasswordStep(1)
    setLoading(false)
    setShowPassword(false)
    setShowConfirmPassword(false)
  }, [state])

  useEffect(() => {
    let timer
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setLoading(true)
    try{
      if(state === 'Sign Up'){
        if (!confirmPassword) {
          toast.warn('Please confirm your password')
          return
        }
        if (password !== confirmPassword) {
          toast.error('Passwords do not match.')
          return
        }
        
        if (!showOtpScreen) {
          const { data } = await axios.post(backendUrl + '/api/user/send-register-otp', { name, email, password })
          if (data.success) {
            toast.success(data.message)
            setShowOtpScreen(true)
            setResendCooldown(60)
          } else {
            toast.error(data.message)
          }
        }
      }
      else{
        const {data} = await axios.post(backendUrl + '/api/user/login', {password, email})

        if(data.success){
          localStorage.setItem('token', data.token)
          setToken(data.token)
        }
        else{
          toast.error(data.message)
        }  
      }
    }
    catch(error){
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (event) => {
    event.preventDefault()
    if (!otp || otp.length !== 6) {
      toast.warn('Please enter the 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/user/verify-register-otp', { name, email, password, otp })
      if (data.success) {
        toast.success(data.message)
        localStorage.setItem('token', data.token)
        setToken(data.token)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    setLoading(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/user/send-register-otp', { name, email, password })
      if (data.success) {
        toast.success(data.message)
        setResendCooldown(60)
        setOtp('')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToRegister = () => {
    setShowOtpScreen(false)
    setOtp('')
  }

  const handleSendResetOtp = async (event) => {
    event.preventDefault()
    if (!email) {
      toast.warn('Please enter your email')
      return
    }
    setLoading(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/user/send-reset-otp', { email })
      if (data.success) {
        toast.success(data.message)
        setForgotPasswordStep(2)
        setResendCooldown(60)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyResetOtp = async (event) => {
    event.preventDefault()
    if (!otp || otp.length !== 6) {
      toast.warn('Please enter the 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/user/verify-reset-otp', { email, otp })
      if (data.success) {
        toast.success(data.message)
        setForgotPasswordStep(3)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    if (!password) {
      toast.warn('Please enter a new password')
      return
    }
    if (!confirmPassword) {
      toast.warn('Please confirm your new password')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/user/reset-password', { email, otp, password })
      if (data.success) {
        toast.success(data.message)
        setState('Login')
        setForgotPasswordStep(1)
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setOtp('')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendResetOtp = async () => {
    if (resendCooldown > 0) return
    setLoading(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/user/send-reset-otp', { email })
      if (data.success) {
        toast.success(data.message)
        setResendCooldown(60)
        setOtp('')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (event) => {
    if (state === 'Forgot Password') {
      if (forgotPasswordStep === 1) {
        handleSendResetOtp(event)
      } else if (forgotPasswordStep === 2) {
        handleVerifyResetOtp(event)
      } else if (forgotPasswordStep === 3) {
        handleResetPassword(event)
      }
    } else {
      if (showOtpScreen) {
        handleVerifyOtp(event)
      } else {
        onSubmitHandler(event)
      }
    }
  }

  useEffect(() => {
    if(token){
      navigate('/')
    }
  }, [token])

  return (
    <form onSubmit={handleFormSubmit} className="min-h-[80vh] flex items-center justify-center px-4 py-8 sm:px-0">
      <div className="flex flex-col gap-4 w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border text-zinc-600 text-sm">

        {state === 'Forgot Password' ? (
          <>
            {forgotPasswordStep === 1 && (
              <>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-800">Forgot Password</p>
                  <p className="mt-1 text-gray-500">Enter your registered email to request a reset code</p>
                </div>
                <div className="w-full">
                  <p className="font-medium">Email</p>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F6FFF] transition"
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`mt-2 w-full rounded-md bg-[#5F6FFF] py-2.5 text-base font-medium text-white hover:bg-[#4a5cf5] transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {loading ? 'Sending OTP...' : 'Send Reset OTP'}
                </button>
              </>
            )}

            {forgotPasswordStep === 2 && (
              <>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-800">Verify Reset OTP</p>
                  <p className="mt-1 text-gray-500">We sent a 6-digit OTP to: <br/><span className="font-semibold text-gray-700">{email}</span></p>
                </div>
                <div className="w-full">
                  <p className="font-medium text-center mb-1">Enter OTP</p>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-center text-xl font-bold tracking-[0.5em] placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-[#5F6FFF] transition"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    value={otp}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`mt-2 w-full rounded-md bg-[#5F6FFF] py-2.5 text-base font-medium text-white hover:bg-[#4a5cf5] transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <div className="flex flex-col gap-3.5 items-center text-center pt-2">
                  <button
                    type="button"
                    onClick={handleResendResetOtp}
                    disabled={resendCooldown > 0}
                    className={`text-sm font-medium transition-colors ${resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#5F6FFF] hover:text-[#4a5cf5] cursor-pointer'}`}
                  >
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordStep(1)}
                    className="text-xs text-[#5F6FFF] hover:underline cursor-pointer"
                  >
                    ← Edit Email
                  </button>
                </div>
              </>
            )}

            {forgotPasswordStep === 3 && (
              <>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-800">Reset Password</p>
                  <p className="mt-1 text-gray-500">Enter your new secure password</p>
                </div>
                <div className="w-full">
                  <p className="font-medium">New Password</p>
                  <div className="relative mt-1">
                    <input
                      className="w-full rounded-md border border-gray-300 pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F6FFF] transition"
                      type={showPassword ? "text" : "password"}
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="w-full">
                  <p className="font-medium">Confirm Password</p>
                  <div className="relative mt-1">
                    <input
                      className="w-full rounded-md border border-gray-300 pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F6FFF] transition"
                      type={showConfirmPassword ? "text" : "password"}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      value={confirmPassword}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`mt-2 w-full rounded-md bg-[#5F6FFF] py-2.5 text-base font-medium text-white hover:bg-[#4a5cf5] transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </>
            )}

            <div className="text-center pt-2 border-t border-gray-150 mt-2">
              <span
                onClick={() => { setState('Login'); setForgotPasswordStep(1); }}
                className="text-[#5F6FFF] font-medium underline cursor-pointer"
              >
                Back to Login
              </span>
            </div>
          </>
        ) : (
          <>
            {showOtpScreen ? (
              <>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-800">Verify Your Email</p>
                  <p className="mt-1 text-gray-500">We sent a 6-digit OTP to: <br/><span className="font-semibold text-gray-700">{email}</span></p>
                </div>

                <div className="w-full">
                  <p className="font-medium text-center mb-1">Enter OTP</p>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-center text-xl font-bold tracking-[0.5em] placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-[#5F6FFF] transition"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    value={otp}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`mt-2 w-full rounded-md bg-[#5F6FFF] py-2.5 text-base font-medium text-white hover:bg-[#4a5cf5] transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div className="flex flex-col gap-3.5 items-center text-center pt-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                    className={`text-sm font-medium transition-colors ${resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#5F6FFF] hover:text-[#4a5cf5] cursor-pointer'}`}
                  >
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToRegister}
                    className="text-xs text-[#5F6FFF] hover:underline cursor-pointer"
                  >
                    ← Back to Registration
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-800">
                    {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
                  </p>
                  <p className="mt-1 text-gray-500">
                    Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book an appointment
                  </p>
                </div>

                {
                  state === 'Sign Up' && (
                    <div className="w-full">
                      <p className="font-medium">Full Name</p>
                      <input
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F6FFF] transition"
                        type="text"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        required
                      />
                    </div>
                  )
                }

                <div className="w-full">
                  <p className="font-medium">Email</p>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F6FFF] transition"
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required
                  />
                </div>

                <div className="w-full">
                  <p className="font-medium">Password</p>
                  <div className="relative mt-1">
                    <input
                      className="w-full rounded-md border border-gray-300 pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F6FFF] transition"
                      type={showPassword ? "text" : "password"}
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {state === 'Login' && (
                    <div className="text-right mt-1.5">
                      <span
                        onClick={() => setState('Forgot Password')}
                        className="text-xs text-[#5F6FFF] hover:underline cursor-pointer font-medium"
                      >
                        Forgot Password?
                      </span>
                    </div>
                  )}
                </div>

                {
                  state === 'Sign Up' && (
                    <div className="w-full">
                      <p className="font-medium">Confirm Password</p>
                      <div className="relative mt-1">
                        <input
                          className="w-full rounded-md border border-gray-300 pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F6FFF] transition"
                          type={showConfirmPassword ? "text" : "password"}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          value={confirmPassword}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  )
                }

                <button
                  type="submit"
                  disabled={loading}
                  className={`mt-2 w-full rounded-md bg-[#5F6FFF] py-2.5 text-base font-medium text-white hover:bg-[#4a5cf5] transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {loading ? 'Processing...' : (state === 'Sign Up' ? 'Create Account' : 'Login')}
                </button>

                <div className="text-center pt-2">
                  {state === 'Sign Up'
                    ? (
                      <p>
                        Already have an account?{' '}
                        <span
                          onClick={() => setState('Login')}
                          className="text-[#5F6FFF] font-medium underline cursor-pointer"
                        >
                          Login here
                        </span>
                      </p>
                    )
                    : (
                      <p>
                        Create a new account?{' '}
                        <span
                          onClick={() => setState('Sign Up')}
                          className="text-[#5F6FFF] font-medium underline cursor-pointer"
                        >
                          Click here
                        </span>
                      </p>
                    )
                  }
                </div>
              </>
            )}
          </>
        )}

      </div>
    </form>
  )
}

export default Login
