const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

const { SendPushNotification } = require('../utils/Notification')
const paymentModel = require("../models/payment.model");
const checkObjectId = require('../middleware/checkobjectId');


//get payment 
router.get('/', auth,admin, async (req, res) => {
    const { page, limit, fieldname, order, searchBy } = req.query
    const currentpage = page ? parseInt(page, 10) : 1
    const per_page = limit ? parseInt(limit, 10) : 5
    const CurrentField = fieldname ? fieldname : "createdAt"
    const currentOrder = order ? parseInt(order, 10) : -1
    let offset = (currentpage - 1) * per_page;
    const sort = {};
    sort[CurrentField] = currentOrder
    // return res.json(sort)

  
    const search = searchBy ? {
  
      name: { '$regex': `${searchBy}`, $options: "i" }
  
  
  
    } : {};
  
  
    try {
      let payments = await paymentModel.find({ ...search}).populate(
  
        {
  
            path: 'order',
          
        }
  
  
      ).limit(per_page).skip(offset).sort(sort)
      if (!payments.length) {
        return res
          .status(400)
          .json({ message: 'no payments exist' });
      }
  
  
     
      let Totalcount = await paymentModel.find({ ...search }).countDocuments()
      const paginate = {
        currentPage: currentpage,
        perPage: per_page,
        total: Math.ceil(Totalcount / per_page),
        to: offset,
        data: payments
      }
      res.status(200).json(paginate)
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

//pay payment



//place order 

router.post(
    '/',
    [
      auth
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
  
  
  
      try {
  
        
        let customer = ""
        let charge = ""
        if (req.body.paymentMethod.toLowerCase() == "paypal") {
          order.paymentMethod = req.body.paymentMethod
        }
  
        else if (req.body.paymentMethod.toLowerCase() == "stripe") {
          order.paymentMethod = req.body.paymentMethod
          let m = req.body.card_expiry.split("/")
          let cardNumber = req.body.card_number;
          let token = await stripe.tokens.create({
            card: {
              number: cardNumber,
              exp_month: m[0],
              exp_year: m[1],
              cvc: req.body.cvv
            }
          })
          if (token.error) {
            return res.status(400).json({ message: error })
          }
  
          customer = await stripe.customers.create({
            email: req.user.email,
            source: token.id,
          })
          // console.log("customer",customer)
  
          charge = await stripe.charges.create({
            amount: req.body.totalPrice,
            description: 'Paleo Keto',
            currency: 'usd',
            customer: customer.id
          })
          // console.log("charge",charge)
  
  
        }
        const createdOrder = await order.save();
  
        const paymentLog = new paymentModel({
          order: createdOrder.id,
          user: req.user._id,
          customer_id: req.body.paymentMethod == "cod" ? null : customer.id,
          charge_id: req.body.paymentMethod == "cod" ? null : charge.id,
          amount: req.body.totalPrice,
          type: req.body.paymentMethod == "cod" ? "cod" : "card"
        });
  
        await paymentLog.save();
  
  
        return res.status(201).send({ message: 'New Order Created', order: createdOrder });
      }
  
  
      //      const data = {
      //       notifiableId: luggers.user._id,
      //       title: "Request  Received",
      //       notificationType: "RequestReceived",
      //       body: "New Request Received",
      //       payload: {
      //         "type": "RequestReceived",
      //         "id": newRequest._id
      //       }
      //     }
  
  
      //   const resp = SendPushNotification(data)
  
  
  
      // console.log(resp)
      // console.log(result);
      // return res.status(200).json({
      //     code: 200,
      //     message: 'New Property has been added',
      // });
  
      catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
      }
    }
  );




// get order detail by id

router.get('/:payment_id', [auth, checkObjectId('payment_id')], async (req, res) => {

    let id = req.params.order_id
  
    try {
      let payment = await paymentModel.findOne({ _id: id }).populate('order').lean();
   

 
      if (!payment) return res.status(400).json({ message: 'payment Detail not found' });
      const url = baseUrl(req)
  
      // product.images.forEach((image, index) => {
      //     product.images[index] = `${url}${product.images[index]}`
      //     // console.log(image, index)
      // })
  
      res.status(200).json(payment);
  
    } catch (error) {
      // console.error(error.message);
      res.status(500).json({ "error": error.message });
    }
  });
  
  


module.exports=  router