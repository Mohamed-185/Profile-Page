import express from 'express';
import path from 'path';
import multer from 'multer';
import { dirname } from "path";
import { fileURLToPath } from "url";
import pool from "./database.js"

const app = express();
const port = 3000;

const storage = multer.diskStorage({
    destination:function(req,file,cd){
        cd(null,path.join(__dirname,"public/imgaes"));
    },
    filename: function(req,file,cd){
        cd(null,file.originalname);
    }
})

const upload = multer({storage})

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "Public")));

app.get("/", (req, res) => {
    res.render("./loginPage.ejs",{ errorMessage:null })
})

app.get("/loginPage", (req, res) => {
    res.render("./loginPage.ejs",{ errorMessage: null })
})

app.get("/registerPage", (req, res) => {
    res.render("./registerPage.ejs",{
        errorMessage:null, 
        takenInfo: false, 
        firstName: "", 
        lastName: "", 
        email: "", 
        password: "", 
        twitter: "", 
        linkedIn: "", 
        facebook: "", 
        skype: "", 
        insta: "", 
        image: ""
    });
})


app.post("/loginUser", async (req, respond) => {

    let enteredEmail = req.body["email"], enteredPassword = req.body["password"]

    await pool.connect()

    await pool.query(`select * from users where email = '${enteredEmail}'`, (err, res) => {
        // console.log(res.rows);
      
        if (!err) {
            if(res.rows.length==0){
                respond.render("./loginPage.ejs", { errorMessage: "Wrong Email, please try again." });            
            }
            
            else if (enteredPassword == res.rows[0].password) {

                let firstName = res.rows[0].firstname, lastName = res.rows[0].lastname, image = res.rows[0].image
                let insta = res.rows[0].insta, facebook = res.rows[0].facebook, twitter = res.rows[0].twitter, linkedIn = res.rows[0].linkedin, skype = res.rows[0].skype
                let fullName = firstName + " " + lastName

                respond.render("./ProfilePage.ejs", { 
                    fullName: fullName, 
                    firstName: firstName, 
                    lastName: lastName, 
                    email: enteredEmail, 
                    insta: insta, 
                    facebook: facebook, 
                    twitter: twitter, 
                    skype: skype, 
                    linkedIn: linkedIn, 
                    image: image
                })
            } else {
                respond.render("./loginPage.ejs", { 
                    errorMessage: "Wrong password, please try again." 
                });
            }
        }
        else respond.render("./loginPage.ejs",{ errorMessage: null })
    })
})

app.post("/registerUser",upload.single("image"), async (req, respond) => {
    let firstName = req.body["firstName"], lastName = req.body["lastName"], email = req.body["email"], password = req.body["password"], confirmPassword = req.body["ConfirmPassword"]

    let image = "../imgaes/" + req.file.originalname

    await pool.connect()

    await pool.query(`select * from users where email = '${email}'`, (err, res) => {
        if(res.rows.length  != 0)
            respond.render("./registerPage.ejs",{
            errorMessage:"This email has already been registered",
            takenInfo: false, 
            firstName: "", 
            lastName: "", 
            email: "", 
            password: "", 
            twitter: "", 
            linkedIn: "", 
            facebook: "", 
            skype: "", 
            insta: "", 
            image: ""
        });
        else if (password != confirmPassword)
            respond.render("./registerPage.ejs",{
            errorMessage:"Passwords don't match", 
            takenInfo: false, firstName: "", 
            lastName: "", 
            email: "", 
            password: "", 
            twitter: "", 
            linkedIn: "", 
            facebook: "", 
            skype: "", 
            insta: "", 
            image: ""
        });
        else {
            respond.render("./registerPage.ejs",{
                errorMessage:null, 
                takenInfo: true, 
                firstName: firstName, 
                lastName: lastName, 
                email: email, 
                password: password, 
                twitter: "", 
                linkedIn: "", 
                facebook: "", 
                skype: "", 
                insta: "", 
                image: image
            })
        }
    })
})



app.post("/linksAdding", async (req, res) => {
    let firstName = req.body["firstName"], lastName = req.body["lastName"], email = req.body["email"], password = req.body["password"]
    let fullName = firstName + " " + lastName
    let image = req.body["image"]
    let insta = req.body["insta"], facebook = req.body["facebook"], twitter = req.body["twitter"], skype = req.body["skype"], linkedIn = req.body["linkedIn"]


    await pool.connect()
    await pool.query("insert into users (email, firstname, lastname, password, facebook, insta, twitter, skype, linkedin, image) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)", [email, firstName, lastName, password, facebook, insta, twitter, skype, linkedIn, image], (err, res) => {
        if(err)
            console.log(err)
    })
    res.render("./ProfilePage.ejs", { fullName: fullName,
        firstName: firstName,
        lastName: lastName, 
        email: email, 
        facebook: facebook,
        twitter:twitter, 
        insta: insta, 
        linkedIn: linkedIn, 
        skype: skype, 
        image: image 
    })
})


app.post("/editInfo", (req, res) => {
    res.render("editProfile.ejs",{
        takenInfo: false,
        errorMessage:null,
        oldEmail:req.body["curEmail"],
        firstName: "",
        lastName: "",
        email: "",
        image: "",
        password: ""
    });
})

app.post("/updatedProfile", upload.single("image"), async (req, respond) => {
    await pool.connect()
    await pool.query(`select * from users where email = '${req.body["email"]}'`, (err, res) => {

        if (!err) {
            if ((res.rows.length === 1 && req.body["email"] != req.body["oldEmail"]))
                respond.render("editProfile.ejs",{
                    takenInfo: false,
                    errorMessage:"This email has already been registered",
                    oldEmail:req.body["oldEmail"],
                    firstName: "",
                    lastName: "",
                    email: "",
                    image: "",
                    password: ""
                })
            else if(req.body["password"] != req.body["confirmPassword"])
                respond.render("editProfile.ejs",{
                    takenInfo: false,
                    errorMessage:"Passwords don't match",
                    oldEmail:req.body["oldEmail"],
                    firstName: "",
                    lastName: "",
                    email: "",
                    image: "",
                    password: ""
                })
            else {

                let firstName = req.body["firstName"], lastName = req.body["lastName"], email = req.body["email"], password = req.body["password"]
                let image = "../imgaes/" + req.file.originalname

                respond.render("./editProfile.ejs",{
                    takenInfo: true,
                    errorMessage:null,
                    firstName: firstName, 
                    lastName: lastName, 
                    password: password, 
                    email: email, 
                    image: image,
                    oldEmail: req.body["oldEmail"]
                })
            }
        }else console.log(err)
    })
})

app.post("/fullUpdated", async (req, respond) => {
    let firstName = req.body["firstName"], lastName = req.body["lastName"], email = req.body["email"], password = req.body["password"]
    let fullName = firstName + " " + lastName, image = req.body["image"]
    let insta = req.body["insta"], facebook = req.body["facebook"], twitter = req.body["twitter"], skype = req.body["skype"], linkedIn = req.body["linkedIn"]

    await pool.connect()
    pool.query("update users set email = $1,firstname = $2,lastname = $3,password = $4, facebook = $5, insta = $6, twitter = $7, linkedin = $8, skype = $9, image = $10 where email = $11", [email, firstName, lastName, password, facebook, insta, twitter, linkedIn, skype, image, req.body["oldEmail"]], (err, res) => { })
    respond.render("./ProfilePage.ejs", { 
        fullName: fullName, 
        firstName: firstName, 
        lastName: lastName, 
        email: email, 
        facebook: facebook, 
        twitter:twitter, 
        insta: insta, 
        linkedIn: linkedIn, 
        skype: skype, 
        image: image 
    })
})




app.listen(port, (req, res) => {
    console.log(`server is running on port number ${port}`);
})
