const express = require('express')
// var expressBusboy = require('express-busboy');
const engines = require("consolidate");

const app = express()
const path  = require('path')
const port  = process.env.port || 5000
// var multer = require('multer')

const connectDB = require('./config/db')
var cors = require('cors');
require('dotenv').config()
var multipart = require('connect-multiparty');

// expressBusboy.extend(app, {
//   upload: true,
//   path: '/uploads/images',
//   allowedPath: /./
// });
//db connection
connectDB()
app.use(multipart());

  
app.engine('ejs', require('ejs').__express)
app.set("views", path.join(__dirname,'templates'))
app.set("view engine", "ejs");
app.use(cors())
app.options('*', cors())
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true }))
// app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');

  next();
});



require('./routes')(app)



app.get("/uploads/images/:name", (req, res) => {
    res.sendFile(path.join(__dirname, `./uploads/images/${req.params.name}`));
  });


  app.get("/uploads/files/:name", (req, res) => {
    res.sendFile(path.join(__dirname, `./uploads/files/${req.params.name}`));
  });

app.get('/',(req,res)=>{
    res.send('server runnning')
})
app.listen(port,()=>{
    console.log(`Server is running at the port ${port}`)
})

app.get('/success',(req,res)=>{
      res.render('success')
})