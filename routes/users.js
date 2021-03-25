const express = require('express')
const config = require('config')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator');
const router = express.Router()

// @route     POST api/users
// @desc      Register a user
// @access    public
router.post('/', [
    body('name', 'Enter a name').not().isEmpty(),
    body('email', 'Enter Valid Email').isEmail(),
    body('password', 'Enter a password of 6 or more characters').isLength({ min: 6 })

],async (req, res, next) => {
    
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body

    try{

        let user = await User.findOne({ email })
        if(user){
            return res.status(400).json({ msg: "User already exists" })
        }

        user = new User({
            name,
            email,
            password
        })

        const salt = await bcrypt.genSalt(10)

        user.password = await bcrypt.hash(password, salt)

        await user.save()

        const payload = {
            user:{
                id: user._id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), {
            expiresIn: 360000
        }, (err, token) => {
            if(err) throw err
            res.send({ token })
        })
    }
    catch(err){

        console.log(err)
        res.status(500).send("Server Error")
    }

})

module.exports = router