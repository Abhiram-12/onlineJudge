const express=require('express');
const app=express();
const dotenv=require("dotenv");
const {DBconnection}= require("./database/db.js");
const User=require("./models/users.js");
const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken");


DBconnection()

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

        const token=jwt.sign({id:user._id,email},process.env.SECRET_KEY,{
            expiresIn:"1d",
        });


        }
        catch(error){
            console.log(error);
        }

});


app.listen(8080,()=>{
    console.log("server running on 8080")
});