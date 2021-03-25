const express = require('express')
const auth = require('../middleware/auth')
const { body, validationResult } = require('express-validator')
const router = express.Router()

const User = require('../models/User')
const Contact = require('../models/Contact')

// @route     GET api/contacts
// @desc      Get all users contacts
// @access    private
router.get('/', auth, async (req, res, next) => {
    
    try{
        const contacts = await Contact.find({ user: req.user.id })
        res.json(contacts)

    }catch(err){
        console.log(err.message)
        res.status(500).send('Server Error')
    }
    
})

// @route     POST api/contacts
// @desc      Add a contact
// @access    private
router.post('/', [ auth, [
    body('name', 'Name is Required').not().isEmpty()
]], async (req, res, next) => {
    
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, phone, type } = req.body;

    try{

        const newContact = new Contact({
            name,
            email,
            phone,
            type,
            user: req.user.id
        })

        const contact = await newContact.save()

        res.json(contact)

    }catch(err){
        res.status(500).send('Server Error')
    }

})

// @route     POST api/contacts/:id
// @desc      Update contacts
// @access    private
router.put('/:id', auth, async (req, res, next) => {
    
    const { name, email, phone, type } = req.body;
    
    const contactFields = {}
    if(name) contactFields.name = name
    if(email) contactFields.email = email
    if(phone) contactFields.phone = phone
    if(type) contactFields.type = type


    try{
        let contact = await Contact.findById(req.params.id)

        if(!contact) return res.status(404).json({ msg: "No contact found" })

        if(contact.user.toString() !== req.user.id) return res.status(401).json({ msg: "Not authorized" })

        contact = await Contact.findByIdAndUpdate(req.params.id,{ $set: contactFields }, { new: true })

        res.json(contact)

    }catch(err){
        res.status(500).send('Server Error')
    }

})

// @route     DELETE api/contacts/:id
// @desc      Delete contact
// @access    private
router.delete('/', async (req, res, next) => {
    res.send('Delete contact')
    try{
        let contact = await Contact.findById(req.params.id)

        if(!contact) return res.status(404).json({ msg: "No contact found" })

        if(contact.user.toString() !== req.user.id) return res.status(401).json({ msg: "Not authorized" })

        contact = await Contact.findByIdAndRemove(req.params.id)

        res.json({ msg: "Contact Removed" })

    }catch(err){
        res.status(500).send('Server Error')
    }
})

module.exports = router