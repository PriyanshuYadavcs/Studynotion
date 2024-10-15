const Course= require("../models/Course"); 
const Category= require("../models/Category"); 
const Section= require("../models/Section"); 
const SubSection= require("../models/SubSection"); 

exports.createCourse= async(req, res)=>{
    try{
        const userId= req.user.id; 
        let { 
            courseName, 
            courseDescription, 
            whatYouWillLearn, 
            price, 
            tag:_tag, 
            category, 
            status, 
            instructions: _instructions, 
        }= req.body; 
        const thumbnail= req.files.thumbnailImage; 
        const tag= JSON.parse(_tag); 
        const instructions= JSON.parse(_instructions); 

        console.log("tag", tag); 
        console.log("Instructions", instructions); 

        if(!courseName || 
        !courseDescription ||
        !whatYouWillLearn || 
        !price ||
        !tag.length || 
        !thumbnail || 
        !category ||
        !instructions.length
        ){
            return res.status(400).json({
                success:false, 
                message :" all"
            })
        }

        if(!status || status === undefined){
            status= "Draft"
        }

        const instructorDetails= await User.findById(userId, {
            accountType: "instructor", 
        })

        if(!instructorDetails){
            return res.status(404).json({
                success: false, 
                message: "instructor details not found",
            })
        }

        const categoryDetails= await Category.findById(category); 
        
    }
    catch(error){
        console.log(error); 
    }
}


/*

    uploading the image to cloudinary; 
    creating the new course. 

    user schma me bhi dalna h jo instructor  ke ki usne padhaya h 
    await User.findByIdAndUpdate(
      {
        _id: instructorDetails._id,
      },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    )


    add the new course to the category 
    then return the new course and a success message; 



    EDIT COURSE DETAILS 
    

    update only the fields that are present in the request body; 
    for(const key in updates){
        if(updates.hasownproperty(key)){
            if(key==="tag" || key==="instructions"){
            course[key]=JSON.parse(updates[key])
            } else {
             course[key]= updates[key]}
        }
    }
    

    jab update krdo toh ese save krna hota h bc 
    course.save() karke 

    Ensure Full Population of Related Fields:

After saving the course with the updated data, the course object in memory is not automatically populated with related documents (e.g., instructor, category, courseContent).
When you update fields in the document (like tag, instructions, or others), the course object will have the updated values for those fields, but any populated fields like instructor, additionalDetails, category, etc., will not be present unless explicitly populated.







*/