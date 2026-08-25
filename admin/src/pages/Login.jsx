import React, { use, useContext, useState } from 'react'
import {assets} from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DoctorContext } from '../context/DoctorContext'
import { useNavigate } from 'react-router-dom'


const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const {setAToken, backendUrl, loginState, setLoginState} = useContext(AdminContext)
    const {setDToken} = useContext(DoctorContext)

    const onSubmitHandler = async(event) => {
        event.preventDefault()
        try{
            if(loginState === 'Admin'){
                const {data} = await axios.post(backendUrl + '/api/admin/login', {email, password})

                if(data.success){
                    localStorage.setItem('aToken', data.token)
                    setAToken(data.token)
                    
                }
                else{
                    toast.error(data.message)
                }
            }
            else{
                const {data} = await axios.post(backendUrl + '/api/doctor/login', {email, password})

                if(data.success){
                    localStorage.setItem('dToken', data.token)
                    setDToken(data.token)
                    console.log(data.token)
                    
                }
                else{
                    toast.error(data.message)
                }                
            }
        }
        catch(error){

        }
    }


  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
        <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg bg-white'>
            <p className='text-2xl font-semibold m-auto'> <span className='text-[#5F6FFF]'>{loginState}</span> Login </p>

            <div className='w-full'>
                <p>Email</p>
                <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-[#DADADA] rounded w-full p-2 mt-1' type='email' required/>
            </div>

            <div className='w-full'>
                <p>Password</p>
                <div className='relative w-full mt-1'>
                    <input 
                        onChange={(e) => setPassword(e.target.value)} 
                        value={password} 
                        className='border border-[#DADADA] rounded w-full p-2 pr-10' 
                        type={showPassword ? 'text' : 'password'} 
                        required
                    />
                    <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center p-1.5 rounded-full hover:bg-gray-100 transition-colors'
                    >
                        {showPassword ? (
                            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-4 h-4 text-gray-500'>
                                <path strokeLinecap='round' strokeLinejoin='round' d='M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88' />
                            </svg>
                        ) : (
                            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-4 h-4 text-gray-500'>
                                <path strokeLinecap='round' strokeLinejoin='round' d='M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z' />
                                <path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' />
                            </svg>
                        )}
                    </button>
                </div>
                {loginState === 'Doctor' && (
                    <span 
                        onClick={() => navigate('/forgot-password')} 
                        className='text-[#5F6FFF] underline cursor-pointer text-xs mt-1.5 block text-right w-full'
                    >
                        Forgot Password?
                    </span>
                )}
            </div>

            <button className='bg-[#5F6FFF] text-white w-full py-2 rounded-md text-base cursor-pointer mt-2'>
                Login
            </button>

            {
                loginState === 'Admin'
                ? <p>Doctor Login? <span className='text-[#5F6FFF] underline cursor-pointer' onClick={() => { setLoginState('Doctor'); setShowPassword(false); }}>Click here</span> </p>
                : <p>Admin Login? <span className='text-[#5F6FFF] underline cursor-pointer' onClick={() => { setLoginState('Admin'); setShowPassword(false); }}>Click here</span> </p>
            }
        </div>
    </form>
  )
}

export default Login