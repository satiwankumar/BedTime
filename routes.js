//importing api's
const express = require('express')
const Users = require('./routes/users')
const Auth  = require('./routes/auth')
const Contact  = require('./routes/contact')
const Notification = require('./routes/notifications')
// const Content =  require('./routes/content')
const Dashboard = require('./routes/dashboard')
// const AssignedServices = require('./routes/AssignedServices')
module.exports = function(app){
//look for dependency
//Middlware
app.use(express.json())
app.use('/api/users',Users)
app.use('/api/auth',Auth)
// app.use('/api/about',About)
app.use('/api/contact',Contact)
app.use('/api/notifications',Notification)
app.use('/api/dashboard',Dashboard)


// app.use(error)


}