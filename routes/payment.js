const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

const { SendPushNotification } = require('../utils/Notification')
const paymentModel = require("../models/payment.model");
const checkObjectId = require('../middleware/checkobjectId');
const payment  =  require('../models/payment.model')
const stripe = require("stripe")("sk_test_51IXUPEBGTHpfB5dWrRwWJRCYGiv3lqLJdT6eqegdCFNP4KFQRI1qjOlyget9rjUoqFpDTmGqU73IHSe10y9L3iDF00ZtY5Qo39");
const User = require('../models/User.model')
const paypal = require("paypal-rest-sdk");


paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
      "AVHkX5APqzDIaUpcDtjsccYv4LEsT8kDfuADTeWVKZgFFdfxo6qgT9jNejKdeqZfOYr9u-xNo7kzaQdJ",
  client_secret:
      "EE1OGbO-tZ2SE_wtmUrkQjy3EWC4mpjjeHpavchni27FvPa9OpiHj4lcnXlxVf1il3INaBGrIR2l9-yb"
});

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
  

//pay payment strie


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
        let user = await User.findOne({_id:req.user._id})

        const paymentLog = new paymentModel({
            user: req.user._id,
            amount: req.body.totalPrice,
          });

        if (req.body.payment_method.toLowerCase() == "paypal") {
            paymentLog.payment_method = req.body.payment_method
        }
  
        else if (req.body.payment_method.toLowerCase() == "stripe") {
            paymentLog.payment_method = req.body.payment_method
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
        //   console.log("customer",customer)
  
          charge = await stripe.charges.create({
            amount: req.body.totalPrice,
            description: 'Bed Time',
            currency: 'usd',
            customer: customer.id
          })
        //   console.log("charge",charge)
  
          paymentLog.customer_id= customer.id?customer.id:null,
          paymentLog.charge_id=charge.id?charge.id:null
        }
    
       
  
        await paymentLog.save();
        user.is_premium=true
        await user.save()
  
        return res.status(201).send({ message: 'Payment Done Successfully', payment:paymentLog });
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



  router.get('/paypal',(req, res) => {
    var create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal"
        },
        redirect_urls: {
            return_url: "http://192.168.1.106:3000/success",
            cancel_url: "http://192.168.1.106:3000/cancel"
        },
        transactions: [
            {
                item_list: {
                    items: [
                        {
                            name: "item",
                            sku: "item",
                            price: "1.00",
                            currency: "USD",
                            quantity: 1
                        }
                    ]
                },
                amount: {
                    currency: "USD",
                    total: "1.00"
                },
                description: "This is the payment description."
            }
        ]
    };

    paypal.payment.create(create_payment_json, function(error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            res.redirect(payment.links[1].href);
        }
    });
})



router.post("/success",async(req, res) => {
  try {
    let user = await User.findOne({_id:req.user._id})

    const paymentLog = new paymentModel({
        user: req.user._id,
        amount: req.body.totalPrice,
      });
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        payer_id: PayerID,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: req.body.totalPrice
                }
            }
        ]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function(
        error,
        payment
    ) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            // res.render("success");
  


        }
    });
    paymentLog.payment_method = "paypal"
    paymentLog.customer_id= PayerID?PayerID:null,
    paymentLog.paymentId=paymentId?paymentId:null

    await paymentLog.save();
    user.is_premium=true
    await user.save()

    return res.status(201).send({ message: 'Payment Done Successfully', payment:paymentLog });
  } catch (error) {
    
  }
  // res.send("Success");

});




  
module.exports=  router