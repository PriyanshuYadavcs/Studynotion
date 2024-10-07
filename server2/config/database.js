const mongoose= require("mongoose"); 
require("dotenv").config(); 

exports.connect =()=>{
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=> console.log("DB connected successfully"))
    .catch((error)=>{
        console.log("db connection failed"); 
        console.error(error); 
        process.exit(1); 
    })
}
// process.exit(0) = successfull 
// process.exit(1)= unsucc; 