const mongoose = require("mongoose");
const user= require('./User.model')

const payment = new mongoose.Schema({
  
    
user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:user,
        required:true
  },        

  customer_id:{
      type:String
  },
  charge_id:{
      type:String
  },
  payload:{
      type:String
  },
  amount:{
    type:String
},
status:{
 type:Boolean
    
},
type:{
    type:String
}
});

payment.set('timestamps', true)

module.exports = Payment = mongoose.model("Payment", payment)