const mongoose = require('mongoose')

const PremiumCodeSchema = new mongoose.Schema({
 
    
    code:{
        type: String,
        required:true
    }
   

});

PremiumCodeSchema.set('timestamps',true)


module.exports=  PremiumCode = mongoose.model('PremiumCode', PremiumCodeSchema);
