import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

//user authentication middleware

const authUser = async(req, res, next) => {
    try{
        const token = req.headers.token
        if(!token){
            return res.status(401).json({
                success:false,
                message:'Not Authorized. Please login again.'
            })
        }

        let token_decode;
        try {
            token_decode = jwt.verify(token, process.env.JWT_SECRET)
        } catch (err) {
            return res.status(401).json({
                success:false,
                message:'Not Authorized. Please login again.'
            })
        }

        if (!token_decode || !token_decode.id || token_decode.role !== 'patient') {
            return res.status(401).json({
                success:false,
                message:'Not Authorized. Please login again.'
            })
        }

        // Verify patient exists in database
        const user = await userModel.findById(token_decode.id).select('_id')
        if (!user) {
            return res.status(401).json({
                success:false,
                message:'Not Authorized. Please login again.'
            })
        }

        req.userId = token_decode.id
        next()
    }
    catch(error){
        console.log(error)
        res.status(401).json({
            success:false,
            message:'Not Authorized. Please login again.'
        })
    }
}

export default authUser