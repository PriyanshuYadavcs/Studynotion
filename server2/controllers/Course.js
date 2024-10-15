const {contactUsEmail}= require("../mail/templates/contactFormRes"); 
const mailSender= require("../utils/mailSender"); 

exports.contactUsController= async (req, res)=>{
    const {email, firstname, lastname, message, phoneNo, countrycode}= req.body;
    console.log(req.body); 
    try{
        const emailRes= await mailSender(
        email, 
        "Your Data send successfully", 
        contactUsEmail(email, firstname, lastname, message, phoneNo, countrycode)
        )

        console.log("email res", emailRes); 
        return res.json({
            success: true,
            message: "Email send successfully" 
        })
    } catch(error){
        console.log("error", error); 
        console.log("error message", error.message); 
        return res.json({
            success: false, 
            message: "something went wrong...", 
        })
    }
}