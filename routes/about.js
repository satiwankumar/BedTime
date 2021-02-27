const express = require('express')
const router = express.Router();
const { check, validationResult } = require('express-validator');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth')
const fs = require('fs');
var path = require('path');
const About = require('../models/about.model')
const { baseUrl } = require('../utils/url')



router.get('/', async (req, res) => {
    try {
        // console.log(req.user)
        let about = await About.findOne()


        if (!about) {
            return res
                .status(400)
                .json({ message: 'No About Info exist' });
        }



        const url = baseUrl(req)

        about.images.forEach((image, index) => {
            about.images[index] = `${url}${about.images[index]}`
            console.log(image, index)
        })



        res.status(200).json(about)
    } catch (error) {
        // console.error(error.message)
        res.status(500).json({ "error": error.message })
    }

})



router.post('/',[auth,admin,check('about_us', 'title  is required').not().isEmpty(),check('description', 'description  is required').not().isEmpty()],async (req, res) => {
    try {
        const {title,description,images} =req.body
        let about = await About.findOne({})
        if (about) {
            // return res
            //     .status(400)
            //     .json({ message: ' About Info already  exist' });
         about.title=title,
         about.description=description
         let image = req.body.images?req.body.images:""
        //  const salt = await bcrypt.genSalt(10)
         // let filename = bcrypt.hashSync(r, salt).substring(-1, 7)
         // console.log(image)
         if(req.body.images){
           
            about.images.forEach((image,index)=>{
                if (image !=="") {
                    fs.unlinkSync(path.join(__dirname, `../${about.images[index]}`));
                }
               
            })
            about.images= []
            //  console.log("image found")
            images.forEach(image => {
                var data = image.replace(/^data:image\/\w+;base64,/, "");
                let buff = new Buffer.from(data, 'base64');
                let r = Math.random().toString(36).substring(7)
        
                let pathName = `uploads/about/${r}.png`;
                fs.writeFileSync(path.join(__dirname, `../${pathName}`), buff)
                
                about.images.push(pathName)
        
            });
         // var full_address = req.protocol + "://" + req.headers.host ;
             }
        }
        else{
       about  =  new About({
        title : title,
        description:description

     })
     let image = req.body.images?req.body.images:""
    
     // console.log(image)
     if(req.body.images){
        //  console.log("image found")
        images.forEach(image => {
            var data = image.replace(/^data:image\/\w+;base64,/, "");
            let buff = new Buffer.from(data, 'base64');
            let r = Math.random().toString(36).substring(7)
    
            let pathName = `uploads/about/${r}.png`;
            fs.writeFileSync(path.join(__dirname, `../${pathName}`), buff)
            about.images.push(pathName)
    
        });
     // var full_address = req.protocol + "://" + req.headers.host ;
         }
   

    }



    await  about.save()
     return res.status(200).json({ message: 'About information added Successsfully.' });

    } catch (error) {
        
        // console.error(error.message)
        res.status(500).json({ "error": error.message })
    }

})

module.exports = router