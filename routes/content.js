const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const fs = require('fs');
var path = require('path');
const { baseUrl } = require('../utils/url')
// const User = require('../models/services.model')
const Content = require('../models/content.model')
const checkObjectId = require('../middleware/checkobjectId');
// const multer = require('multer');
const { count } = require('../models/content.model');
// const upload = multer();

//post Service

router.post('/',[auth],
    async (req, res) => {
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     return res.status(400).json({ errors: errors.array() });
        // }
console.log(req.body,req.files)
        
const {file_title,file_description,file_type,file_age_group,is_premium,language} = req.body
      const{file,file_image}=req.files
    //   console.log(req.body) 

        try {
        //   console.log("file",file)
             content = new Content({
                file_title:file_title,
               file_description:file_description,
               file_type:file_type,
               file_age_group:file_age_group,
               is_premium:is_premium,
               language:language

            });

            // if(file.length>0){
            //     file.forEach( async file => {
                    // var data = image.replace(/^data:image\/\w+;base64,/, "");
                    // let buff = new Buffer.from(data, 'base64');
                    if(file){
                        let r = Math.random().toString(36).substring(7)    
                        let pathName = `uploads/files/${file.originalFilename.replace(/\s/g, '')}`;
                        var stream = fs.readFileSync(file.path);
                       await  fs.writeFileSync(path.join(__dirname, `../${pathName}`),stream)
                        content.file = pathName
                    }
                    
                    
                // });
            // }
                if(file_image){
                    //  file_image.replace(/^data:image\/\w+;base64,/, "");
                    // let buff = new Buffer.from(data, 'base64');
                    let r = Math.random().toString(36).substring(7)    
                    let pathName = `uploads/images/${file_image.originalFilename.replace(/\s/g, '')}`;
                    var stream = await fs.readFileSync(file_image.path);
                   await  fs.writeFileSync(path.join(__dirname, `../${pathName}`),stream)
                    content.file_image = pathName
                    
                }

  
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


router.post('/like/:id',[auth],
    async (req, res) => {


        try {
              const content = await Content.findById(req.params.id)
                if(content.likes.filter(like=>like.user ==req.user._id).length>0){
                    let userIndex  =content.likes.findIndex(like=>like.user ==req.user._id)
                    console.log("content.indexOf(user)",userIndex)
                    content.likes.splice(userIndex,1)

                }else{
                    content.likes.unshift({user:req.user._id})
                }

                await content.save()



            //   let contents =  await  Content.aggregate(
            //         // [
            //         // {$unwind : "$likes"},
            //         //   { $group : { _id : "$_id" , count : { $sum : 1 } } },
            //         //   { $sort : { count : -1 } },
            //         //   { $limit : 5 }
            //         // ]
            //         [
            //             {
            //               $project: {
            //                 _id: 1,
            //                 numberOfLikes: {
            //                   $cond: {
            //                     if: {
            //                       $isArray: "$likes"
            //                     },
            //                     then: {
            //                       $size: "$likes"
            //                     },
            //                     else: "NA"
            //                   }
                              
            //                  }
            //                 // {$sort: { numberOfLikes: -1 } }

            //               }
            //             }
            //           ]
            //       )
                  


                return res.json(content)

            
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: error.message });
        }
    }
);



// 
router.get('/trending',[auth],
async (req, res) => {


    try {
        //   const content = await Content.findById(req.params.id)
        //     if(content.likes.filter(like=>like.user ==req.user._id).length>0){
        //         let userIndex  =content.likes.findIndex(like=>like.user ==req.user._id)
        //         console.log("content.indexOf(user)",userIndex)
        //         content.likes.splice(userIndex,1)

        //     }else{
        //         content.likes.unshift({user:req.user._id})
        //     }

        //     await content.save()



          let contents =  await  Content.aggregate(
                // [
                // {$unwind : "$likes"},
                //   { $group : { _id : "$_id" , count : { $sum : 1 } } },
                //   { $sort : { count : -1 } },
                //   { $limit : 5 }
                // ]
                [
                    {$unwind : "$likes"},
                    {$group : { 
                        _id : "$_id",
                        content : {"$addToSet" : {'fileType':'$file_title'}},
                        likes : {$push : "$likes"},
                        count : {$sum : 1},
                     },
                    },
                    {$sort : {'count': -1}},
                ]
                    
              )
              


            return res.json(contents)

        
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
}
);






//getContent
router.get('/', auth, async (req, res) => {
    const { page, limit, fieldname, order, searchBy ,selection} = req.query
    const currentpage = page ? parseInt(page, 10) : 1
    const per_page = limit ? parseInt(limit, 10) : 5
    const CurrentField = fieldname ? fieldname : "createdAt"
    const currentOrder = order ? parseInt(order, 10) : 1
    let offset = (currentpage - 1) * per_page;
    // let Selection = selection?selection:""
    const sort = {};
    sort[CurrentField] = currentOrder
    // return res.json(sort)


    const search = searchBy ? {
        "$and": [
            { description: { '$regex': `${searchBy}`, $options: "i" } },
            { title: { '$regex': `${searchBy}`, $options: "i" } },
           
        ]
    } : {};

    const filter = {};

      for (const key in req.query) {
        if (req.query.hasOwnProperty(key)) {
          const value = req.query[key];
          if (key=="page" || key=="limit"){

          }
          else if(value){
            filter[key] = value;
                
          }
        }
      }
    console.log(filter)
    try {
        let content = await Content.find({ ...search,...filter }).limit(per_page).skip(offset).sort(sort)
     
    
        // console.log(users)
        if (!content.length) {
            return res
                .status(200)
                .json({ message: 'no content exist' });
        }
        const url = baseUrl(req)

        content.forEach((file, index) => {
            content[index].file = `${url}${content[index].file}`
            content[index].file_image = `${url}${content[index].file_image}`
            
                            // console.log(image, index)
                        })
        
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

// router.post('/remove',[auth,admin],async(req,res)=>{
//     try { 
//    const content_id = req.body.content_id
//     const content =  await  Content.findOneAndDelete({ _id: content_id })
//         if(!content){
//   return res.status(200).json({"message":"content not found"})

//  } 
//   return res.status(200).json({"message":"content deleted Successfully"})

//     } catch (err) {
//         console.error(err.message);
//         return res.status(500).json({ error: err.message });
//     }
  


// })



//update
router.post('/update', auth, async (req, res) => {
  
   

    
    try {
   
        // let content =await Content.updateMany(
        //     { language:"fr",file_type:"pronunciation" },
        //     [{
        //       $set: {file_description: {
        //         $replaceOne: { input: "$file_description", find: "Pronunciation Of Alphabet", replacement: "Prononciation de l'alphabet" }
        //       }}
        //     }]
        //   )
        // let content =await Content.updateMany(
        //     [{
        //       $set: {is_premium:true}
        //     }])
        

        // res.status(200).json(content)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




module.exports = router