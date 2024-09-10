const {instance} = require("../config/razorpay")
const Course= require("../models/Course")
const crypto= require("crypto")
const User= require("../models/User")
const mailSender= require("../utils/mailSender")
const mongoose= require("mongoose")

const {
    courseEntrollMentEmail
}= require("../mails/courseEnrollmentEmail"); 

const {paymentSuccessEmail}= require("../models/CourseProgress") 

exports.capturePayment= async (req,res)=>{
    const {courses}= req.body
    const userId= req.user.userId
    if(courses.length===0){
        return res.json({
            success:false, 
            message: "please provide course id"
        })
    }
    let total_amount=0;

    for(const course_id of courses){
        let course 
        try{ 
            course = await Course.findById(course_id)

            if(!course){
                return res
                .status(200)
                .json({
                    sucess:false, 
                    message: "could not find the course"
                })
            }

            const uid= new mongoose.Types.ObjectId(userId)
            if(course.studentsEnroled.includes(uid)){
                return res
                .status(200)
                .json({
                    success:false, 
                    message: "student is already enrolled"
                })
            }

            total_amount+= course.price
        } catch(error){
            console.log(error)
            return res.status(500).json({ success:false, 
                message: error.message
            })
        }
    }
    const options= { 
        amount: total_amount *100, 
        currency: "INR",
        receipt: Math.random(Date.now()).toString(),
    }

}