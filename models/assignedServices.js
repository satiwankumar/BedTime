const mongoose = require('mongoose')
const user  = require('./User.model')
// const Service = require('./services.model')

const AssignedServices = new mongoose.Schema({
 
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: user
    },
    // services: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: Service
    // }]
    
});

AssignedServices.set('timestamps',true)


module.exports=  AssignedService = mongoose.model('AssignedServices', AssignedServices);
