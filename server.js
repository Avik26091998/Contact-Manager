const express = require('express')
const connectDB = require('./config/db')

// initialize express app
const app = express()

// Connect to mongodb
connectDB()

// body-parser
app.use(express.json({ extended: false }))

// routes
app.use('/api/users', require('./routes/users'))
app.use('/api/contacts', require('./routes/contacts'))
app.use('/api/auth', require('./routes/auth'))

// access port from env variables
const PORT = process.env.PORT || 5000

// server listens on PORT
app.listen(PORT, ()=>{
console.log(`sERVER RUNNING ON PORT ${PORT}`)
})