const mongoose=require('mongoose');
const dotenv=require('dotenv');
dotenv.config();

const DBconnection= async ()=>{
    const MONGO_URI=process.env.MONGO_URI;
    try{
        await mongoose.connect(MONGO_URI,{useNewUrlParser:true});
        console.log("Database connected succesfully");
    }
    catch( error){
        console.log("Error connecting to database",error.message);
    }
}

module.exports={DBconnection};