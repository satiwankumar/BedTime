const express = require('express');
const router = express.Router();
const Notification = require('../models/notifications.model');
const { check, validationResult } = require('express-validator');
const axios = require('axios')
const FCM = require('fcm-node')
const config = require('config')
const auth  = require('../middleware/auth')
const admin  = require('../middleware/admin');
const Session = require('../models/session.model');
const checkObjectId = require('../middleware/checkobjectId');
const {SendPushNotification}  = require('../utils/Notification')


//set the route path and initialize the API

router.get('/admin', [auth,admin], async (req, res) => {
    


    try {
        console.log(req.query)
    const {page,limit} = req.query
    
  let  currentpage =  page ? parseInt(page, 10) : 1 
    // console.log(currentpage)

   let per_page = limit? parseInt(limit, 10) : 3
    // console.log(limit)
    
    let offset = (currentpage - 1) * per_page;
    let notifications = await Notification.find({notificationType:"Admin"}).populate('notifiableId',['id','email']).limit(per_page).skip(offset).lean().sort({'createdAt':-1});
    if (!notifications.length) {
        return res
            .status(400)
            .json({ message: 'no notification exist' });
    }
    
   let Totalcount = await Notification.find({notificationType:"Admin"}).populate('notifiableId',['id','email']).count()
    const paginate = {
    currentPage: currentpage,
    perPage: per_page,
    total: Math.ceil(Totalcount/per_page),
    to: offset,
    data: notifications
    }
    
    return res.json(paginate);

      
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/', auth, async (req, res) => {
    


    try {
        console.log(req.query)
    const {page,limit} = req.query
    
  let  currentpage =  page ? parseInt(page, 10) : 1 
    // console.log(currentpage)

   let per_page = limit? parseInt(limit, 10) : 5 
    // console.log(limit)
    
    let offset = (currentpage - 1) * per_page;
    let notifications = await Notification.find({notifiableId:req.user._id}).populate('notifiableId',['id','email']).limit(per_page).skip(offset).lean().sort({'createdAt':-1});
    if (!notifications.length) {
        return res
            .status(400)
            .json({ message: 'no notification exist' });
    }
    
   let Totalcount = await Notification.find({notifiableId:req.user._id}).populate('notifiableId',['id','email']).count()
    const paginate = {
    currentPage: currentpage,
    perPage: per_page,
    total: Math.ceil(Totalcount/per_page),
    to: offset,
    data: notifications
    }
    
    return res.json(paginate);

      
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// router.get('/', auth, async (req, res) => {
    


//     try {
//         console.log(req.query)
//     const {page,limit} = req.query
    
//   let  currentpage =  page ? parseInt(page, 10) : 1 
//     console.log(currentpage)

//    let per_page = limit? parseInt(limit, 10) : 5 
//     console.log(limit)
    
//     let offset = (currentpage - 1) * per_page;
//     let notifications = await Notification.find({notifiableId:req.user._id}).populate('notifiableId',['id','email']).limit(per_page).skip(offset).lean().sort({'createdAt':-1});
//     if (!notifications.length) {
//         return res
//             .status(400)
//             .json({ message: 'no notification exist' });
//     }
    
//    let Totalcount = await Notification.find({notifiableId:req.user._id}).populate('notifiableId',['id','email']).count()
//     const paginate = {
//     currentPage: currentpage,
//     perPage: per_page,
//     total: Math.ceil(Totalcount/per_page),
//     to: offset,
//     data: notifications
//     }
    
//     return res.json(paginate);

      
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

router.post('/',auth,[
    check('notifiableId', 'notifiableId is required').not().isEmpty(),
    check('notificationType', 'notificationType is required').not().isEmpty(),
    check('title', 'title is required').not().isEmpty(),
    check('body', 'Please Enter body ').not().isEmpty()

],async (req,res)=>{
    const errors = validationResult(req);
   
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

    try {
        console.log(req.body)
        const {notifiableId,notificationType,title,body} = req.body
        checkObjectId(notifiableId)


         const notification  = new Notification({
            notifiableId:notifiableId,
            notificationType:notificationType,
            title:title,
            body:body

        })

        await notification.save()
        return res.status(200).json("notification created successfully")




    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// router.get('/', [auth], async (req, res) => {
    


//     try {
//         console.log(req.query)
//     const {page,limit} = req.query
    
//   let  currentpage =  page ? parseInt(page, 10) : 1 
//     console.log(currentpage)

//    let per_page = limit? parseInt(limit, 10) : 5 
//     console.log(limit)
    
//     let offset = (currentpage - 1) * per_page;
//     let notifications = await Notification.find({notifiableId:req.user._id}).populate('notifiableId',['id','email']).sort({createdAt: -1}).limit(per_page).skip(offset).lean();
//     if (!notifications.length) {
//         return res
//             .status(400)
//             .json({ message: 'no notification exist' });
//     }
    
//    let Totalcount = await Notification.find({notifiableId:req.user._id}).populate('notifiableId',['id','email']).count()
//     const paginate = {
//     currentPage: currentpage,
//     perPage: per_page,
//     total: Math.ceil(Totalcount/per_page),
//     to: offset,
//     data: notifications
//     }
    
//     return res.json(paginate);

      
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// router.post('/',auth,[
//     check('notifiableId', 'notifiableId is required').not().isEmpty(),

//     check('notificationType', 'notificationType is required').not().isEmpty(),
//     check('title', 'title is required').not().isEmpty(),
//     check('body', 'Please Enter body ').not().isEmpty()

// ],async (req,res)=>{
//     const errors = validationResult(req);
   
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//     try {
//         console.log(req.body)
//         const {notifiableId,notificationType,title,body} = req.body
//         checkObjectId(notifiableId)


//          const notification  = new Notification({
//             notifiableId:notifiableId,
//             notificationType:notificationType,
//             title:title,
//             body:body

//         })

//         await notification.save()
//         return res.status(200).json("notification created successfully")




//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });




// router.put('/notifications/:id',function(req,res,next){
//   Notification.findByIdAndUpdate({_id:req.params.id},req.body).then(function(){
//     Notification.findOne({_id:req.params.id}).then(function(notification){
//       console.log(req.body, 'what is happening');
//       res.send(notification);
//     });
//   })
// });

// router.delete('/notifications/:id',function(req,res,next){
//   Notification.findByIdAndRemove({_id:req.params.id}).then(function(notification) {
//   res.send(notification);
//     });
// });

// router.post('/sendPushNotification',[
//     check('notifiableId', 'notifiableId is required').not().isEmpty(),
//     check('notificationType', 'notificationType is required').not().isEmpty(),
//     check('title', 'title is required').not().isEmpty(),
//     check('body', 'Please Enter body ').not().isEmpty()

// ],async (req,res)=>{
//     const errors = validationResult(req);
   
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//     try {
//         // console.log(req.body)
//         const {notifiableId,notificationType,title,body,payload} = req.body
//         // checkObjectId(notifiableId)


//         //  const notification  = new Notification({
//         //     notifiableId:notifiableId,
//         //     notificationType:notificationType,
//         //     title:title,
//         //     body:body

//         // })

//         // await notification.save()
//         // return res.status(200).json("notification created successfully")
//         const data = {
//             notifiableId:notifiableId,
//             title:title,
//             notificationType: notificationType,
//             body: body,
//             payload: payload
//           }
    
//           // console.log(data)
//           const resp = await SendPushNotification(data)
//           console.log(resp)
//           return res.status(200).json({ message: 'Notification has been sent' });




//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });


module.exports = router;