const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { body, validationResult } = require('express-validator')
const config = require('config')
const auth = require('../middleware/auth')
const router = express.Router()

// @route     GET api/auth
// @desc      Get logged in user
// @access    private
router.get('/', auth, async (req, res, next) => {
    
    try{

        let user = await User.findById(req.user.id)
        res.status(200).json({user})

    }catch(err){
        console.log(err.message)    
        res.status(500).json({msg: "Servor error"})
    }
})

// @route     POST api/auth
// @desc      Auth user and get token
// @access    public
router.post('/', 
    [
        body('email', 'Enter Valid Email').isEmail(),
        body('password', 'Enter a password of 6 or more characters').isLength({ min: 6 })
], async (req, res, next) => {
    
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body
    
    try{
        
        let user = await User.findOne({ email })

        if(!user){
            return res.status(400).json({msg: "Enter valid credentials"})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.status(400).json({msg: "Enter valid credentials"})
        }

        const payload = {
            user:{
                id: user._id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), {
            expiresIn: 360000
        }, (err, token) => {
            if(err) throw err
            res.send(token)
        })

    }catch(err){
        console.log(err.message)
        res.status(500).json({error: "Server Error"})
    }

})

module.exports = router