const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const config = require('config');


const UserSchema = new mongoose.Schema({
    image:
    {
        type: String
    },
    username:
    {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    
    email: 
    {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: 
    {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
 
    resetCode:
    {
        type: Number,
         default: ""
    },
    status: 
    {
        type: Number,
         default: 1
    },
    
    isAdmin: 
    {
        type: Boolean,
        default: false,
        required: true
    },
    averageRating:{
        type:Number,
        default:0
    },
    city:
    {
        type:String,
        default:null
    }, 
    country: 
    {
        type:String,
        default:null
    },
    state:
    {
        type:String,
        default:null
    },
    zip_code:
    {
        type:String,
        default:null
    },
    address:
    {
        type:String,
        default:null
    },
    phone_no:
    {
        type:String,
        default:null
    },
    gender:
    {
        type:String,
        required:true
    },
    level_type:{
        type:String,
        required:true
    },
    age_group:{
        type:String,
        required:true
    },
    is_premium:{
        type:Boolean,
        default:false
    },
    parents:{
        type:String,
        default:null
    }
   
    
});

UserSchema.set('timestamps', true)








 
UserSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        {
        _id: this._id, isAdmin: this.isAdmin ,status:this.status
     },config.get('jwtSecret')
     );
    return token;
}




module.exports = User = mongoose.model('user', UserSchema)