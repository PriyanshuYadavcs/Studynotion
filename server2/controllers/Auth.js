const bcrypt= require("bcryptjs");
const user= require("../models/User");
const OTP = require("../models/OTP");
const jwt= require("jsonwebtoken");
const otpGenerator= require("otp-generator")
const mailSender= require("../utils/mailSender");
const {passwordUpdated}= require("../mail/templates/passwordUpdate");


const Profile = require("../models/Profile");
require("dotenv").config();

exports.signup = async (req, res)=>{
    try{
        const { 
            firstName, 
            lastName, 
            email, 
            password, 
            confirmPassword, 
            accountType, 
            contactNumber, 
            otp,
        }= req.body; 
        if(!firstName || 
            !lastName ||
            !email ||
            !password || 
            !confirmPassword ||
            !otp
        ) {
            return res.status(403).send({
                success: false, 
                message: "All fields are required"
            })
        }

        if(password !== confirmPassword){
            return res.status(400).send({
                success: false, 
                message: "All fields are required",
            })
        }

        const existingUser = await user.findOne({email})
        if(exisitingUser){
            return res.status(400).json({
                success: false, 
                message: "User already exists. please sign in to continue",
            })
        }
        const response= await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(response); 
        if(response.length === 0){
            return res.status(400).json({
                success: false, 
                message: "The otp is not valid", 
            })
        } else if(otp !== response[0].otp){
            return res.status(400).json({
                success: false, 
                message: " the otp is not valid ",
            })
        }

        const hashedPassword= await bcrypt.hash(password, 10); 
        let approved= ""
        approved=== "Instructor" ? (approved= false) : (approved= true)

        const profileDetails= await Profile.create({
            gender: null, 
            dateOfBirth : null,
            about: null, 
            contactNumber: null, 
        })


        const user= await User.create({
            firstName,
            lastName,
            email, 
            contactNumber, 
            password: hashedPassword, 
            accountType: accountType, 
            approved: approved, 
            additionalDeetails: profileDetails._id, 
            image: "", 
        })

        return res.status(200).json({
            success: true, 
            user, 
            message: "User registered successfully",
        })
    } catch(error){
        console.error(error)
        return res.status(500).json({
            success:false, 
            message: "User cannot be registered . please try again"
        })
    }
}


exports.login= async (req, res)=>{
    try{ 
        const {email, password}= req.body; 

        if(!email || !password){
            return res.status(400).json({
                success:false, 
                message: `please fill up all the required fields`,
            })
        }
        const user= await User.findOne({email}).populate("additionalDetails")
        if(!user){
            return res.status(401).json({
                success:false, 
                message: `User is not registered with us please signup to continue`, 
            })
        }
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
              { email: user.email, id: user._id, role: user.role },
              process.env.JWT_SECRET,
              {
                expiresIn: "24h",
              }
            )
      
            // Save token to user document in database
            user.token = token
            user.password = undefined
            // Set cookie for token and return success response
            const options = {
              expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
              httpOnly: true,
            }
            res.cookie("token", token, options).status(200).json({
              success: true,
              token,
              user,
              message: `User Login Success`,
            })

          } else {
            return res.status(401).json({
                success: false, 
                message: `p`
            })
          }
    } catch(error){
        console.error(error)
        return res.status(500).json({
            success: false, 
            message: `login failure please try again`,
        })
    }
}

exports.sendotp = async(req, res)=>{
    try{
        const {email}= req.body; 
        const checkUserPresent= await User.findOne({email}); 
        if(checkUserPresent){
            return res.status(401).json({
                success:false, 
                message: `user is already registered`,
            })
        }

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false, 
            lowerCaseAlphabets: false, 
            specialChars: false, 
        }); 
        const result= await OTP.findOne({otp:otp});
        console.log(" RESLT IS GENERATE OTP FUNC"); 
        console.log("OTP", otp); 
        console.log("result", result);
        while(result){
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false, 
            })
        }

        const otpPayLoad= {email, otp};
        const otpBody= await OTP.create(otpPayLoad); 
        console.log("OTP BODY", otpbody);
        res.status(200).json({
            success: true, 
            message: `otp sent successfully`,
            otp, 
        })
    } catch(error){
        console.log(error.message); 
        return res.status(500).json({
            success:false, 
            error: error.message
        })
    }
}