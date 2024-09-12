const {instance} = require("../config/razorpay")
const Course= require("../models/Course")
const crypto= require("crypto")
const User= require("../models/User")
const mailSender= require("../utils/mailSender")
const mongoose= require("mongoose")

const {
    courseEntrollMentEmail,
    courseEnrollmentEmail
}= require("../mails/courseEnrollmentEmail"); 

const {paymentSuccessEmail}= require("../models/CourseProgress") 
const CourseProgress = require("../models/CourseProgress")

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

    try { 
        const paymentResponse= await instance.orderes.create(options);
        console.log(paymentResponse);
        res.json({
            success: true, 
            data: paymentResponse, 
        })
    } catch (error){
        console.log(error)
        res.status(500).json({success: false, message: "Could not initiate order."})
    }
}

exports.verifyPayment= async(req, res)=>{
    const razorpay_order_id= req.body?.razorpay_order_id
    const razorpay_payment_id= req.body?.razorpay_payment_id
    const razorpay_signatue= req.body?.razorpay_signatue
    const courses= req.body?.courses
    const userId= req.user.userId

    if(
        !razorpay_order_id || 
        !razorpay_payment_id ||
        !razorpay_signatue ||
        !courses ||
        !userId
    ) {
        return res.status(200).json({
            success: false, 
            message: "Payment failed"
        })
    }

    const expectedSignature= crypto..createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex")


    if(expectedSignature=== razorpay_signatue){
        await enrollStudents(courses, userId, res)
        return res.status(200).json({success: true, 
            message: "payment verified"
        })
    }

    return res.status(200).json({
        success:false, 
        message: "payment failed"
    })


}


exports.sendPaymentSuccessEmail= async (req, res)=>{
    const {orderId, paymentId, amount}= req.body

    const userId= req.user.id

    if(!orderId || !paymentId || !amount || !userId){
        return res.status(400).json({success: false,
            message: "Please provide all the details"
        })
    }

    try{
        const enrolledStudent = await User.findById(userId)

        await mailSender(
            enrolledStudent.email, 
            `Payment received`,
            paymentSuccessEmail(
                `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
                amount/100,
                orderId, 
                paymentId
            )
        )
    } catch (error){
        return res.status(400).json({
            success: false, 
            message: "could not send email"
        })
    }
    
}


const enrollStudents= async (courses, userId, res)=>{
    if(!courses || !userId){
        return res.status(400).json({
            success: false, 
            message: "Please provide course id and user id"
        })
    }

    for(const courseId of courses){
        try{
            const enrolledCourse= await Course.findOneAndUpdate(
                {_id: courseId}, 
                { $push: {studentsEnroled: userId}}, 
                {new: true}
            )

            if(!enrolledCourse){
                return res.status(500).json({
                    success: false, 
                    error: "course not found"
                })
            }

            console.log("updated course:", enrolledCourse)

            const courseProgress= await CourseProgress.create({
                courseId: courseId, 
                userId: userId,
                completedVideos: [],
            })

            const enrolledStudent= await User.findByIdAndUpdate(
                userId, 
                {
                    $push: {
                        courses: courseId, 
                        courseProgress: courseProgress._id,
                    },
                },
                {new:true}
            )

            console.log("enrolled student:", enrolledStudent)

            const emailResponse= await mailSender(
                enrolledStudent.email, 
                `Successfully Enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(
                    enrolledCourse.courseName, 
                    `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
                )
            )

            console.log("email sent successfully: ", emailResponse.response)
        } catch(error){
            console.log(error)
            return res.status(400).json({sucess:false,
                error: error.message
            })
        }
        

    }
}