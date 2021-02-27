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

    }

});

ContentSchema.set('timestamps',true)


module.exports=  Content = mongoose.model('Content', ContentSchema);
