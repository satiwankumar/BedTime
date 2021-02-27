const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const fs = require('fs');
var path = require('path');
const { baseUrl } = require('../utils/url')
const User = require('../models/services.model')
const Content = require('../models/content.model')
const checkObjectId = require('../middleware/checkobjectId');
const multer = require('multer');
const upload = multer();

//post Service

router.post('/',[auth],
    async (req, res) => {
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     return res.status(400).json({ errors: errors.array() });
        // }

        
const {file_title,file_description,service} = req.body
      const{file}=req.files
    //   console.log(req.body) 

        try {
        //   console.log("file",file)
             content = new Content({
            
                service:service,
                file_title:file_title,
               file_description:file_description
            });

            // if(file.length>0){
            //     file.forEach( async file => {
                    // var data = image.replace(/^data:image\/\w+;base64,/, "");
                    // let buff = new Buffer.from(data, 'base64');
                    let r = Math.random().toString(36).substring(7)    
                    
                    let pathName = `uploads/files/${r+" "+file.originalFilename}`;
                    var stream = fs.readFileSync(file.path);
                   await  fs.writeFileSync(path.join(__dirname, `../${pathName}`),stream)
                    content.file.push(pathName)
                    
                // });
            // }
  
            await content.save();

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
            return res.status(200).json({
                code: 200,
                message: 'Content Added Successfully',
            });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: error.message });
        }
    }
);


//getContent
router.get('/', auth, async (req, res) => {
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
        "$and": [
            { description: { '$regex': `${searchBy}`, $options: "i" } },
            { title: { '$regex': `${searchBy}`, $options: "i" } },
           
        ]
    } : {};


    try {
        let content = await Content.find({ ...search }).populate('service').limit(per_page).skip(offset).sort(sort)
     

        // console.log(users)
        if (!content.length) {
            return res
                .status(200)
                .json({ message: 'no service exist' });
        }
     
        
        let Totalcount = await Content.find({ ...search }).countDocuments()
        const paginate = {
            currentPage: currentpage,
            perPage: per_page,
            total: Math.ceil(Totalcount / per_page),
            to: offset,
            data: content
        }
        res.status(200).json(paginate)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//getContentDetialByID
router.get('/:content_id', [auth, checkObjectId('content_id')], async (req, res) => {

    let content_Id = req.params.content_id

    try {
        let content = await Content.findOne({ _id: content_Id }).populate('service').lean();
        if (!content) return res.status(400).json({ message: 'Contents not found' });
        const url = baseUrl(req)

        content.service.images.forEach((image, index) => {
            content.service.images[index] = `${url}${content.service.images[index]}`
                            // console.log(image, index)
                        })
                        content.file.forEach((image, index) => {
                            content.file[index] = `${url}${content.file[index]}`
                                            // console.log(image, index)
                                        })

       return  res.status(200).json(content)

    } catch (error) {
        // console.error(error.message);
        res.status(500).json({ "error": error.message });
    }
});

//EditContentDetialByID

router.put('/edit/:content_id',
    [
        auth,
        checkObjectId('content_id'),
        [
            check('file_title', 'Title is required').not().isEmpty(),
            check('file_description', 'Description is required').not().isEmpty()
            
        ],
    ],
    async (req, res) => {
        let content_id = req.params.content_id

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }


        const {
          file_title,
          file_description,
          service_id


        } = req.body;


        try {


            let content = await Content.findOne({ _id: content_id })
            // console.log(content)
            if (!content) {
                return res
                    .status(400)
                    .json({ message: 'no  Serivce Found' });
            }
            content.file_title = file_title
            content.file_description = file_description
            content.service=  service_id
        
                await content.save();
            // const url =   baseUrl(req)  
         
            // service.images.forEach((image, index) => {
            //     service.images[index] = `${url}${service.images[index]}`
            //     // console.log(image, index)
            // })
    
            res.status(200).json({
                message: "Content Updated Successfully",
                content: content
            });
        } catch (err) {
          
           
                const errors =[]
                errors.push({message : err.message}) 
                res.status(500).json({ errors: errors });
            
        }
    }
);

router.post('/remove',[auth,admin],async(req,res)=>{
    try { 
   const content_id = req.body.content_id
    const content =  await  Content.findOneAndDelete({ _id: content_id })
        if(!content){
  return res.status(200).json({"message":"content not found"})

 } 
  return res.status(200).json({"message":"content deleted Successfully"})

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: err.message });
    }
  


})




module.exports = router