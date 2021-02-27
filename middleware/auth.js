const jwt = require('jsonwebtoken')
const config = require('config')

const Session = require('../models/session.model')
module.exports = async function (req, res, next) {

    //Get token from the header
 
    
        // res.setHeader("Access-Control-Allow-Origin", "*");
        // res.setHeader("Access-Control-Allow-Credentials", "true");
        // res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
        // res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
         
    
    //verify token
    try {
        const header = req.header('Authorization');
        // console.log(header.split(' ')[1])
        if(!header){
            return res.status(401).json({ message: 'No token authorization denied' })

        }
     
    const token  = header.split(' ')[1]
   

    // console.log(token)


    if (!token) {
        return res.status(401).json({ message: 'No token authorization denied' })
    }
        
        const decoded = jwt.verify(token, config.get('jwtSecret'))
        req.user = decoded;
        // console.log(req.user)

        // if(req.user.status !==1){
        //     return res.status(401).json({msg:'You are block please contact Admin to Activate Account'})
        // }

        const sessions =await Session.findOne({user:req.user._id,token:token,status:true})
        if(!sessions) return res.status(401).json({ message: 'authorization denied' })


        next();
    } catch (error) {
        // console.log("error dedua")
        res.status(401).json({ "error": error.message })
    }

}
