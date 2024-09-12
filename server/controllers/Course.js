const Course= require("../models/Course")
const Category= require("../models/Category")
const Section= require("../models/Section")
const SubSection= require("../models/SubSection")
const User= require("../models/User")
const {uploadImageToCloudinary}= require("../utils/imageUploader")
const CourseProgress= require("../models/CourseProgress")
const {convertSecondsToDuration}= require("../utils/secToDuration")

exports.createCourse= async(req, res)=>{
    try{
        const userId= req.user.userId
        let { 
            courseName, 
            courseDescription, 
            whatYouWillLearn, 
            price, 
            tag: _tag, 
            category, 
            status, 
            instructions: _instructions,
        }= req.body

        const thumbnail= req.files.thumbnailImage

        const tag= JSON.parse(_tag)
        const instructions= JSON.parse(_instructions)

        console.log("tag", tag)
        console.log("instructions", instructions)

        if(
            !courseName ||
            !courseDescription || 
            !whatYouWillLearn || 
            !price || 
            !tag.length || 
            !thumbnail || 
            !category || 
            !instructions.length 
        ) { 
            return res.status(400).json({
                success: false, 
                message: "all fields are mandatory",
            })
        }

        if(!status || status === undefined){
            status= "draft"
        }

        const instructorDetails= await User.findById(userId, {
            accountType: "Instructor", 
        })

        if(!instructorDetails){
            return res.status(404).json({
                success: false, 
                message: "instructor details not found",
            })
        }

        const categoryDetails= await Category.findById(category)
        if(!categoryDetails){
            return res.status(404).json({
                success:false, 
                message: "category details not found", 
            })
        }

        const thumbnailImage= await uploadImageToCloudinary(
            thumbnail, 
            process.env.FOLDER_NAME
        )
        console.log(thumbnailImage)
        const newCourse= await Course.create({
            courseName, 
            courseDescription, 
            instructor: instructorDetails._id, 
            whatYouWillLearn: whatYouWillLearn, 
            price,
            tag, 
            category: categoryDetails._id, 
            thumbnail: thumbnailImage.secure_url, 
            status:status, 
            instructions, 
        })

        await User.findByIdAndUpdate({
            _id: instructorDetails._id, 
        }, 
    {
        $push: {
            courses: newCourse._id, 
        }, 
    },
    {new:true}
        )


    const categoryDetails2= await Category.findByIdAndUpdate(
        {_id: category},
        {$push:{
            courses: newCourse._id, 
        },
    }, 

    {new: true}

    )
        res.status(200).json({
            success: true, 
            data: newCourse, 
            message: "Course created successfully",
        })
    } catch(error){
        console.error(error)
        res.status(500).json({
            success:false, 
            message: "failed to create course", 
            error: error.message, 
        })
    }
}

exports.editCourse= async (req, res)=>{
    try{
        const {courseId}= req.body
        const updates= req.body
        const course= await Course.findById(courseId)

        if(!course){
            return res.status(404).json({
                error: "course not found"
            })
        }
        if(req.files){
            console.log("thumbnail update")
            const thumbnail= req.files.thumbnailImage
            const thumbnailImage= await uploadImageToCloudinary(
                thumbnail, 
                process.env.FOLDER_NAME
            )
            course.thumbnail= thumbnailImage.secure_url
        }

        for(const key in update){
            if(updates.hasOwnProperty(key)){
                if(key === "tag" || key === "instructions"){
                    course[key]= JSON.parse(updates[key])
                } else {
                    course[key]= updates[key]
                }

            }
        }
        await course.save()

        const updatedCourse= await Course.findOne({
            _id: courseId, 
        }). populate({
            path: "instructor", 
            populate: {
                path: "additionalDetails", 
            }, 
        })
        .populate("category")
        .populate("ratingandreviews")
        .populate({
            path:"courseContent", 
            populate: "subSection", 
        },).exec()

        res.json({
            success: true, 
            message: "course updates successfully", 
            data: updatedCourse, 
        })
    } catch (error){
        console.error(error)
        res.status(500).json({
            success: false, 
            message: "internal server error", 
            error: error.message, 
        })
    }
}

exports.getAllCourses= async (req, res)=>{
    try{
        const allCourses= await Course.find(
            {status: "Published"}, 
            {
                courseName: true, 
                price: true, 
                thumbnail: true, 
                instructor: true, 
                ratingAndReviews: true, 
                studentsEnrolled: true, 
            }
        ).populate("instructor").exec()

        return res.status(200).json({
            success:true, 
            data: allCourses, 
        })
    } catch(error){
        console.log(error);
        return res.status(404).json({
            success: false, 
            message: `can't fetch course data`,
            error: error.message, 
        })
    }
}

exports.deleteCourse= async(req, res)=>{
    try{
        const {courseId}= req.body
        const course= await Course.findById(courseId)

        if(!course){
            return res.status(404).json({message: "course not found"})
        }
        const studentsEnrolled= course.studentsEnrolled
            for(const studentId of studentsEnrolled){
                await User.findByIdAndUpdate(studentId, {
                    $pull: {
                        courses: courseId
                    }
                })
            }
        
            const courseSections = course.courseContent
            for(const sectionId of courseSections){
                const section= await Section.findById(sectionId)
                if(section){
                    const subSections= section.SubSection
                    for(const subSectionId of subSections){
                        await SubSection.findByIdAndDelete(subSectionId)
                    }
                }
                await Section.findByIdAndDelete(sectionId)
            }

            await Course.findByIdAndDelete(CourseId)

            return res.status(200).json({
                success: true, 
                message: "course deleted successfully", 
            })
    } catch (error){
        console.error(error)
        return res.status(500).json({
            success:false, 
            message: "server error",
            error: error.message, 
        })
    }

}