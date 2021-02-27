const mongoose = require('mongoose')
const user  = require('./User.model')
const Service = require('./services.model')

const contentSchema = new mongoose.Schema({
 
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Service
    },
    
    file_title:{
        type: String,
       required:true
    },
    file_description:{
        type: String,
        required:true
    },
    file:{
        type:[String],
        default:null
    }

});

contentSchema.set('timestamps',true)


module.exports=  Content = mongoose.model('Content', contentSchema);
