const Razorpay= require("razorpay"); 
exports.instance= new Razorpay({
    key_id: process.env.RAZORPAY_KEY, 
    key_secret: process.env.RAZORPAY_SECRET,
})

// key_ id and key_secret are authentication credentials provided by razorpay when u create an account and integrate their payment gateway into your application .they are used to authenticate and autorize api requests made to the razorpay server from your application.  
