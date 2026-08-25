import mongoose from 'mongoose'

const doctorSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:false,
    },
    image:{
        type:String,
        required:true,
    },
    speciality:{
        type:String,
        required:true,
    },
    degree:{
        type:String,
        required:true,
    },
    experience:{
        type:String,
        required:true,
    },
    about:{
        type:String,
        required:true,
    },
    available:{
        type:Boolean,
        default:true,
    },
    fees:{
        type:Number,
        required:true,
    },
    address:{
        type:Object,
        required:true,
    },
    date:{
        type:Number,
        required:true,
    },
    slots_booked:{ 
        type:Object,
        default:{},
    },
    status:{
        type:String,
        default:'INVITED',
        enum:['INVITED','ACTIVE']
    },
    invitationToken:{
        type:String,
        default:null
    },
    invitationExpires:{
        type:Date,
        default:null
    },
    city: {
        type: String,
        trim: true,
        default: null
    },
    verificationCity: {
        type: String,
        trim: true,
        default: null
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        default: null
    },
    verifiedAt: {
        type: Date,
        default: null
    }
}, {minimize:false})

doctorSchema.index({ status: 1, city: 1, speciality: 1 })

const doctorModel = mongoose.models.doctor || mongoose.model('doctor', doctorSchema)

export default doctorModel