import { useState, createContext, useEffect } from 'react'
import axios from 'axios'
import {toast} from 'react-toastify'

export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

    const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken') : '')
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(null)
    const [profileData, setProfileData] = useState(false)

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response && error.response.status === 401) {
                    const isDoctorApi = error.config.url && error.config.url.includes('/api/doctor');
                    if (isDoctorApi) {
                        setDToken('');
                        localStorage.removeItem('dToken');
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    const getAppointments = async() => {
        try{
            const {data} = await axios.get(backendUrl + '/api/doctor/appointment', {headers: {token:dToken}})

            if(data.success){
                setAppointments(data.appointments)
                console.log(data.appointments)
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
        }
    }


    const completeAppointment = async(appointmentId) => {
        try{
            const {data} = await axios.post(backendUrl + '/api/doctor/complete-appointment', {appointmentId}, {headers: {token:dToken}})
            if(data.success){
                toast.success(data.message)
                getAppointments()
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
        }
    }


    const cancelAppointment = async(appointmentId) => {
        try{
            const {data} = await axios.post(backendUrl + '/api/doctor/cancel-appointment', {appointmentId}, {headers: {token:dToken}})
            if(data.success){
                toast.success(data.message)
                getAppointments()
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
        }
    }


    const getDashData = async() => {
        try{
            const {data} = await axios.get(backendUrl + '/api/doctor/dashboard', {headers: {token:dToken}})

            if(data.success){
                setDashData(data.dashData)
                console.log(data.dashData)
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
        }
    }


    const getProfileData = async() => {
        try{
            const {data} = await axios.get(backendUrl + '/api/doctor/profile', {headers: {token:dToken}})

            if(data.success){
                setProfileData(data.profileData)
                console.log(data.profileData)
            }
        }
        catch(error){
            console.log(error)
            if (error.response?.status !== 401) {
                toast.error(error.message)
            }
        }
    }

    const value = {
        dToken, setDToken,
        backendUrl,
        appointments, setAppointments,
        getAppointments,
        completeAppointment,
        cancelAppointment,
        dashData, setDashData, getDashData,
        profileData, setProfileData,
        getProfileData
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider