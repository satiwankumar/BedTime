const mongoose = require('mongoose')

const ContentSchema = new mongoose.Schema({
 
  
    file_title:{
        type: String,
       required:true
    },
    file_description:{
        type: String,
        required:true
    },
    file_type:{
        type:String,
        required:true
    },
    file:{
        type:String,
        required:true
    },
    file_age_group:{
        type:String,
        default:null
        
    },
    file_image:{
        type:String
        
    },
    is_premium:{
        type:Boolean,
        default:true
    },
    language:{
        type:String,
        required:true
    },
    likes:[
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref:'user'
            }
        }
    ]


});

ContentSchema.set('timestamps',true)


module.exports=  Content = mongoose.model('Content', ContentSchema);
