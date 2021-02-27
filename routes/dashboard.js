const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const fs = require('fs');
var path = require('path');
const { baseUrl } = require('../utils/url')
const checkObjectId = require('../middleware/checkobjectId');
const UserModel = require('../models/User.model');

const {SendPushNotification} = require('../utils/Notification');
// const servicesModel = require('../models/services.model');









router.get('/adminstats',auth,admin, async (req, res) => {
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
        
        
        // let TotalServices = await servicesModel.find().estimatedDocumentCount()
        let TotalUsers = await UserModel.find({isAdmin:false}).countDocuments()
        const data = {
    
                // TotalServices:TotalServices,
                TotalUsers:TotalUsers
            
        }
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});







module.exports=router