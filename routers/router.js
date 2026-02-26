const express = require('express')
const router = express.Router()
const userschema = require('../Module/UserSchema.js')

let localdb = []
const test = {
    Name: " ",
    Password: " ",
    Emailid: " ",
    Mobilenumber: " ",
}
router.get('/router', (req, res) => {
    res.send("this is router ")
})


router.get('/', (req, res) => {

    res.send("This is response to your request")
})

router.get('/name', (req, res) => {
    res.send("Thirumalesh K")
})

router.get('/Info', (req, res) => {
    // res.sendStatus(400)
    res.status(400).send("this is not valid url")
})

router.get("/download", (req, res) => {
    res.download('server.js')
})


router.get("/getdom", (req, res) => {
    res.render('index')
})

router.get('/home', (req, res) => {

    res.render('home', { msg: "wellcom to my WORLD..." })
    // req.render('home','/formdata')
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login', async (req, res) => {
    if (req.body.btn === 'login') {
        try {
            const user = await userschema.findOne({
                Name: req.body.name,
                Password: req.body.password
            });

            if (user) {
                console.log("Login successful");
                res.render("home", { msg: "Login Successful" });
            } else {
                console.log("Login failed");
            }
        }catch{
            console.log("DB Error:", err);
            res.render('login', {msg: "Database Error"});
        }
    }else{
        res.render('home')
    }
        // const newuser = {
        //     Name: req.body.name,
        //     Password: req.body.password,
        //     Emailid: req.body.email,
        //     Mobilenumber: req.body.mobilenumber,
        // };
        // try {
        //     const newuserfromschema = new userschema(newuser);
        //     const dbresponse = await newuserfromschema.save();
        //     console.log("Data Saved" + dbresponse);
        // } catch (err) {
        //     console.log("DB error" + err);
        // }
        // for (let i = 0; i < userschema.length; i++) {
        //     if (user.Name === userschema[i].Name && user.Password === userschema[i].Password) {
        //         console.log('login successful')
        //         break
        //     }
        //     if (i == userschema.length) {
        //         console.log('login failed')
        //     }
        // }
    // } else {
    //     res.render('home')
    // }
})

//async for synchronize 
router.post('/signup', async (req, res) => {
    if (req.body.btn === 'signup') {
        //signup task
        const newuser = {
            Name: req.body.name,
            Password: req.body.password,
            Emailid: req.body.email,
            Mobilenumber: req.body.mobilenumber,
        };
        //for db data saving
        try {
            const newuserfromschema = new userschema(newuser);
            const dbresponse = await newuserfromschema.save();
            console.log("Data Saved" + dbresponse);
        } catch (err) {
            console.log("DB error" + err);
        }

        let emailidval = localdb.some((singleuser, index) => {
            return (singleuser.emailid == newuser.Emailid);
        })
        console.log(emailidval);
        if (emailidval) {
            res.render('signup', { userdata: newuser, msg: "email id is already registered" })
        } else {
            localdb.push(newuser);
            // localdb.push(newuser);
            console.log(localdb)
            res.render('home', { msg: "successfully created new user" })
        }
    } else {
        res.render('home')
    }
})


router.post('/formdata', (req, res) => {
    // res.render('home',{msg:`Now ${req.body.btn} is pressed`})
    if (req.body.btn === "login") {
        res.render('login', { msg: "login mode selected" })
    } else {
        //res.render('signup',{msg:"signup mode selected"})
        res.render('signup', { userdata: test, msg: "signup mode selected" });
    }
})

module.exports = router

