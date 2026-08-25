import jwt from 'jsonwebtoken'
import adminModel from '../models/adminModel.js'

//admin authentication middleware

const authAdmin = async(req, res, next) => {
    try{
        const {atoken} = req.headers
        if(!atoken){
            return res.status(401).json({
                success:false,
                message:'Not Authorized. Please login again.'
            })
        }

        let token_decode;
        try {
            token_decode = jwt.verify(atoken, process.env.JWT_SECRET)
        } catch (err) {
            return res.status(401).json({
                success:false,
                message:'Not Authorized. Please login again.'
            })
        }

        const configuredAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
        if(!token_decode || !token_decode.id || !token_decode.email || !configuredAdminEmail || token_decode.email.toLowerCase().trim() !== configuredAdminEmail){
            return res.status(401).json({
                success:false,
                message:'Not Authorized. Please login again.'
            })
        }

        // Verify Admin still exists in database and email matches
        const admin = await adminModel.findById(token_decode.id).select('_id email')
        if (!admin || admin.email.toLowerCase().trim() !== token_decode.email.toLowerCase().trim()) {
            return res.status(401).json({
                success:false,
                message:'Not Authorized. Please login again.'
            })
        }

        req.adminId = token_decode.id;

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

export default authAdmin