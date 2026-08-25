import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const AcceptInvite = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    // Backend URL (from context/env. Vite dev defaults or absolute path)
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        if (loading) return

        if (!token || !email) {
            return toast.error('Invalid or missing activation parameters.')
        }

        if (password !== confirmPassword) {
            return toast.error('Passwords do not match.')
        }

        if (password.length < 8) {
            return toast.error('Password must be at least 8 characters long.')
        }

        try {
            setLoading(true)
            const { data } = await axios.post(`${backendUrl}/api/doctor/accept-invite`, {
                token,
                email,
                password,
                confirmPassword
            })

            if (data.success) {
                toast.success(data.message || 'Account successfully activated!')
                setTimeout(() => {
                    navigate('/login')
                }, 2000)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
            const msg = error.response?.data?.message || error.message
            toast.error(msg || 'An error occurred during account activation.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center w-full justify-center px-4'>
            <div className='flex flex-col gap-4 m-auto items-start p-8 min-w-[320px] sm:min-w-96 border border-gray-200 rounded-xl text-[#5E5E5E] text-sm shadow-lg bg-white'>
                <div className='text-center w-full mb-2'>
                    <p className='text-2xl font-semibold text-gray-800'>Activate Account</p>
                    <p className='mt-1 text-xs text-gray-500'>Set your secure doctor password for <br/><span className='font-semibold text-gray-700'>{email}</span></p>
                </div>

                <div className='w-full'>
                    <p className='font-medium text-gray-700'>New Password</p>
                    <div className='relative mt-1'>
                        <input
                            className='w-full rounded-md border border-gray-300 pl-3 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-[#5F6FFF] focus:border-[#5F6FFF] transition text-sm'
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
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <div className='w-full'>
                    <p className='font-medium text-gray-700'>Confirm Password</p>
                    <div className='relative mt-1'>
                        <input
                            className='w-full rounded-md border border-gray-300 pl-3 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-[#5F6FFF] focus:border-[#5F6FFF] transition text-sm'
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
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type='submit'
                    disabled={loading}
                    className={`bg-[#5F6FFF] text-white w-full py-2.5 rounded-md text-base font-medium cursor-pointer transition hover:bg-[#4b5cff] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Activating...' : 'Activate Account'}
                </button>
            </div>
        </form>
    )
}

export default AcceptInvite
