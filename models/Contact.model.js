
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        maxlength: 50
    },
    last_name:{
        type: String,
        required: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
    
    },
    subject:{
        type: String,
        require:true

    },
    message: {
        type: String,
        required: true
    }

});
contactSchema.index({ first_name: 'text', last_name: 'text', email: 'text', message: 'text' });
contactSchema.set('timestamps',true)









module.exports=  Contact = mongoose.model('Contact', contactSchema);
