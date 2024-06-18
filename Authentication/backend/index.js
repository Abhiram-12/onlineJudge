const express= require('express');
const dotenv=require("dotenv");
const {DBconnection}= require("./database/db.js");
const User=require("./models/users.js");
const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken");
const cookieParser=require("cookie-parser");
const cors=require("cors");

dotenv.config();

const app= express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors());

DBconnection();


app.post("/register", async (req,res)=>{
    try{
        // get all data from req body
        const {firstname,lastname,email,password}=req.body;

        //check all data should exist
        if(!(firstname&&lastname&&email&&password)){
            return res.status(400).send("Please enter all required data")
        }

        //check if user already exists
        const existingUser= await User.findOne({email});
        if(existingUser){
            return res.send(200).send("user already exists!");
        }

        // encrypt password
        const hashedPassword=await bcrypt.hash(password,10);

        // save the user to data base
        const user= await User.create({
            firstname,
            lastname,
            email,
            password:hashedPassword,
        });
        
        // create a token
        const token=jwt.sign({id:user._id,email},process.env.SECRET_KEY,{
            expiresIn:"1d",
        });
         user.token=token;
         user.password=undefined;
         res.status(201).json({
            message: "You have succesfully registered",
            user
         });

        }
        catch(error){
            console.log(error);
        }

});

app.post("/login",async (req,res)=>{

    try {
        //get all details
        const {email,password}=req.body;
        //check all detials exists
        if(!(email&&password)){
            return res.status(401).send("please enter all req fields!");
        }

        //search for user in db 
        const user=await User.findOne({email});
        if(!user){
            return res.status(401).send("User not found!");
        }

        //check for match of password
        const enteredPassword= await bcrypt.compare(password,user.password);
        if(!enteredPassword){
            return res.status(401).send("Password is incorrect");
        }

        //create token
        const token=jwt.sign({id:user._id},process.env.SECRET_KEY,{
            expiresIn:"1d",
        });
        user.token=token;
        user.password=undefined;

        //store cookies
        const options={
            expires: new Date(Date.now()+1*24*60*60*1000),
            httpOnly:true,
        }

        //send token
        res.status(200).cookie("token",token,options).json({
            message:"You have succesfully logged in",
            success:true,
            token,
        })
        
    } catch (error) {
        console.log(error);
    }
})


app.listen(8080,()=>{
    console.log("server running on 8080")
});