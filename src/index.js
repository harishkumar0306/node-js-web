const express = require('express');
const pasth = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");

const app = express();
// convert data into json format
app.use(express.json());

app.use(express.urlencoded({extended: false}));

// use EJS as the viw engine
app.set('view engine', 'ejs');
//static file
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

// Register User
app.post("/signup",async (req, res) => {

    const data = {
        name: req.body.username,
        password: req.body.password
    }

    // check if the user already exists in the database
    const existingUser = await collection.findOne({name: data.name});
    if(existingUser) {
        res.send("User already exists. please choose a different username.");
    }else {
        // hash the password using bcrypt
        const saltrounds = 10; //Number of salt round for bcrypt
        const hashedpassword = await bcrypt.hash(data.password, saltrounds);

        data.password = hashedpassword; //replace the hash password with original password

        const userdata = await collection.insertMany(data);
        console.log(userdata);
    }

});

//  Login user
app.post("/login", async (req, res) => {
    try{
        const check = await collection.findOne({name: req.body.username});
        if(!check) {
            res.send("user name cannot found");
        }

        //compare the hash password from the database with the plain text
        const ispasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if(ispasswordMatch) {
            res.render("home");
        }else {
            req.send("wrong password");
        }
    }catch{
        res.send("wrong Details");
    }
})



const port = 5000;
app.listen(port, () => {
    console.log(`server running on port: ${port}`);
})
