const mongoose= require("mongoose"); 
const CourseProgress = require("./CourseProgress");
const userSchema= new mongoose.Schema({
    firstName: {
        type: String, 
        required: true, 
        trim: true, 
    }, 
    lastName: {type: String,
        required: true, 
        trim: true, 
    },
    // define the email 
    email: {
        type: String, 
        required: true, 
        trim: true, 
    },
    password: {
        type: String, 
        required: true, 
    }, 
    accountType:{
        type:String, 
        enum: ["Admin", "Student", "audience"], 
        required: true, 
    }, 
    active: {
        type: Boolean, 
        default: true, 
    }, 
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId, 
        required:true, 
        ref: "Profile", 
    }, 
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Course", 
        }
    ], 
    token: {
        type: String, 
    }, 
    resetPasswordExpires: {
        type:Date, 
    }, 
    image: {
        type: String, 
        required: true, 
    },
    CourseProgress: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "courseProgress", 
        }, 
    ], 
}, 
    {timestamps: true}
); 

module.exports= mongoose.model("user", userSchema); 