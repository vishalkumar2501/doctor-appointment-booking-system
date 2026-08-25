import jwt from 'jsonwebtoken'
import doctorModel from '../models/doctorModel.js'

//doctor authentication middleware

const authDoctor = async(req, res, next) => {
    try{
        const dtoken = req.headers.token
        if(!dtoken){
            return res.status(401).json({
                success:false,
                message:'Not Authorized. Please login again.'
            })
        }

        let token_decode;
        try {
            token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)
        } catch (err) {
            return res.status(401).json({
                success:false,
                message:'Not Authorized. Please login again.'
            })
        }

        if(!token_decode || !token_decode.id){
            return res.status(401).json({
                success:false,
                message:'Not Authorized. Please login again.'
            })
        }

        // Verify doctor exists and is ACTIVE
        const doctor = await doctorModel.findById(token_decode.id).select('_id status')
        if (!doctor || doctor.status !== 'ACTIVE') {
            return res.status(401).json({
                success:false,
                message:'Not Authorized. Please login again.'
            })
        }

        req.docId = token_decode.id
        next()
    }
    catch(error){
        console.log(error)
        res.status(401).json({
            success:false,
            message:error.message
        })
    }
}

export default authDoctor