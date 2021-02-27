const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const fs = require('fs');
var path = require('path');
const { baseUrl } = require('../utils/url')
const User = require('../models/services.model')
const AssignedService = require('../models/assignedServices')
const checkObjectId = require('../middleware/checkobjectId');
const multer = require('multer');
const upload = multer();

//Assigned Service to user

router.post('/',[auth],
    async (req, res) => {
        let error = []
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        
const {user,services} = req.body

        try {

            let assignedService = await AssignedService.findOne({user:user})
            if(assignedService){
                services.forEach(serviceId => { 
                   let alreadyExist =  assignedService.services.includes(serviceId)
                   if(!alreadyExist){
                       
                    assignedService.services.push(serviceId)
                   }
    
                })
    
                }
                else{
    
        assignedService = new AssignedService({
            user:user,
           
            });
            services.forEach(item => {
                assignedService.services.push(item)
            });
        }
            await assignedService.save();

                //  const data = {
                //   notifiableId: luggers.user._id,
                //   title: "Request  Received",
                //   notificationType: "RequestReceived",
                //   body: "New Request Received",
                //   payload: {
                //     "type": "RequestReceived",
                //     "id": newRequest._id
                //   }
                // }


            //   const resp = SendPushNotification(data)



            // console.log(resp)
            // console.log(result);
            return res.status(200).json({
                code: 200,
                message: 'Service Access Granted Successfully',
            });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: error.message });
        }
    }
);


//getServicesByUserID
router.get('', auth, async (req, res) => {

    try {
        let assignedService = await AssignedService.findOne({user:req.user._id}).populate('services')
        
    // console.log(users)
        if(!assignedService) {
            return res
                .status(200)
                .json({ message: 'no service exist' });
        }
     
        
        
        res.status(200).json(assignedService)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// //getContentDetialByID
// router.get('/:content_id', [auth, checkObjectId('content_id')], async (req, res) => {

//     let content_Id = req.params.content_id

//     try {
//         let content = await Content.findOne({ _id: content_Id }).populate('service').lean();
//         if (!content) return res.status(400).json({ message: 'Contents not found' });
//         const url = baseUrl(req)

//         content.service.images.forEach((image, index) => {
//             content.service.images[index] = `${url}${content.service.images[index]}`
//                             // console.log(image, index)
//                         })
//                         content.file.forEach((image, index) => {
//                             content.file[index] = `${url}${content.file[index]}`
//                                             // console.log(image, index)
//                                         })

//        return  res.status(200).json(content)

//     } catch (error) {
//         // console.error(error.message);
//         res.status(500).json({ "error": error.message });
//     }
// });

// //EditContentDetialByID

// router.put('/edit/:content_id',
//     [
//         auth,
//         checkObjectId('content_id'),
//         [
//             check('file_title', 'Title is required').not().isEmpty(),
//             check('file_description', 'Description is required').not().isEmpty()
            
//         ],
//     ],
//     async (req, res) => {
//         let content_id = req.params.content_id

//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             res.status(400).json({ errors: errors.array() });
//         }


//         const {
//           file_title,
//           file_description,
//           service_id


//         } = req.body;


//         try {


//             let content = await Content.findOne({ _id: content_id })
//             // console.log(content)
//             if (!content) {
//                 return res
//                     .status(400)
//                     .json({ message: 'no  Serivce Found' });
//             }
//             content.file_title = file_title
//             content.file_description = file_description
//             content.service=  service_id
        
//                 await content.save();
//             // const url =   baseUrl(req)  
         
//             // service.images.forEach((image, index) => {
//             //     service.images[index] = `${url}${service.images[index]}`
//             //     // console.log(image, index)
//             // })
    
//             res.status(200).json({
//                 message: "Content Updated Successfully",
//                 content: content
//             });
//         } catch (err) {
          
           
//                 const errors =[]
//                 errors.push({message : err.message}) 
//                 res.status(500).json({ errors: errors });
            
//         }
//     }
// );



module.exports = router