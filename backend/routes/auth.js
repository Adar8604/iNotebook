const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const Jwt_secret = "Hey$Ram";

router.post('/createUser', [
    body('name').isLength({ min: 3 }),//validation
    body('email', 'Enter a valid Email').isEmail(),
    body('password').isLength({ min: 5 }),
], async (req, res) => {
    let success=false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let user = await User.findOne({ email: req.body.email })
    if (user) {
        res.status(400).json({ error: "Soory a user with this email already exists" })
    }
    try {
        // Securing password using Hash, salt
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        // Storing the data
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })
        // .then(user => res.json(user))
        // .catch(err=>{
        //     console.log(err)
        //     res.json({error:"Pls Enter a unique email"})
        // })

        const data = {
            user: {
                id: user.id
            }
        }
        const Authtoken = jwt.sign(data, Jwt_secret);
        success = true;
        res.json({ success, Authtoken })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }

})

//Authenticate the user for login
router.post('/login', [
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success=false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            success=false;
            return res.status(400).json({ error: "Pls Login with correct Credentials" });
        }
        const comparePassword = await bcrypt.compare(password, user.password);
        if (!comparePassword) {
            success = false;
            return res.status(400).json({ success, error: "Pls Login with correct Credentials" });
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const Authtoken = jwt.sign(data, Jwt_secret);
        success = true;
        res.json({ success, Authtoken })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }

})

//to get the details of user (login required)
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }

})

module.exports = router;