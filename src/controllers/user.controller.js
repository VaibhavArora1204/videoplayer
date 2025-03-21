import { asynchandler } from '../utils/asynchandler';
import { apierror } from "../utils/apierror.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { APIresponse } from "../utils/APIresponse.js"
import jwt from 'jsonwebtoken';
import { mongo } from 'mongoose';


const generateAccessAndRefreshTokens = async (userid) => {
    try {
        const user = await User.findById(userid)
        const accesstoken=user.generateAcessToken()
        const refreshtoken = user.generateRefreshToken()
        
        user.refreshtoken = refreshtoken
        await user.save({ validateBeforeSave: false })
        
        return {accesstoken,refreshtoken}
    } catch (error) {
        throw new apierror(500,"something went wrong while generating access and refresh tokens")
    }
    
}


    //get User details from frontend
    //validation-not empty
    //check if User already exists:Username,email   
    //check for images,check for avatar
    //upload them to cloudinary
    //create User object-create entry in db
    //remove password and refresh token field from res
    //check for User creation
    // return res

const registerUser = asynchandler(async (req, res) => {
    const { fullname, Username, email, password } = req.body;
    // console.log(fullname);
    if ([fullname, Username, email, password].some((field) => field?.trim() === "")) {
        throw new apierror(400, "all fields are required")
    }
    const existedUser=User.findOne({
        $or: [{ email }, { Username }]
    })
    if (!existedUser) {
        throw new apierror(409, "User with email/Username already exists");
    }
    
    // const avatarlocalpath = req.files?.avatar[0]?.path;
    // const coverimagepath = req.files?.coverimage[0]?.path;

    let coverimagepath;
    if (req.files && Array.isArray(req.files.coverimage)
        && req.files.coverimage.length > 0) {
        coverimagepath = req.files.coverimage[0].path;
    }

    let avatarlocalpath;
    if (req.files && Array.isArray(req.files.avatar )
        && req.files.avatar.length > 0) {
        avatarlocalpath = req.files.avatar[0].path;
    }

    if (!avatarlocalpath) {
        throw new apierror(400, "avatar file is required");
    }   
    const avatar = await uploadOnCloudinary(avatarlocalpath); 
    const coverimage = await uploadOnCloudinary(coverimagepath);
    
    if (!avatar) {
        throw new apierror(400, "avatar file is required");
    }
    if (!coverimage) {  
        throw new apierror(400, "coverimage file is required");
    }
    const use=await User.create({
        fullname,
        avatar: avatar.url,
        coverimage: coverimage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(User._id)
        .select(
            "-password  -refreshtoken   "
        )
    if (!createdUser) {
        throw new apierror(500, "something went wrong registering the User")
    }
    return res.status(201).json(
        new APIresponse(200, createdUser, "User registered succesfully")
    )

})      


// req body->data
// Username or email
// if User exists login else signup
// check password
// generate access and refresh token
// send cookies

const loginuser = asynchandler(async (req, res) => {
    const { email, username, password } = req.body;
    if (!username && !email) {
        throw new apierror(400,"signup required")
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw apierror(404, "user dont exist");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new apierror(401,"password or username is incorrect ")
    }

    const { accesstoken, refreshtoken } = await
        generateAccessAndRefreshTokens(user._id)
    
    const loggedInUser = await User.findById(user._id).
        select("--password --refreshtoken")
    
    const options = {
        httpOnly: true,
        secure:true,
    }

    return res
        .status(200)
        .cookie("accesstoken", accesstoken, options)
        .cookie("refreshtoken", refreshtoken, options)
        .json(
            new APIresponse(
                200,
                {
                    user:loggedInUser,accesstoken,refreshtoken
                },
                "user loggedin successfully"
            )
        )
})
    

const logoutuser = asynchandler(async (req, res) => { 
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken:1 //removes the field from the document
            }
        }
    )

    const options = {
        httpOnly: true,
        secure:true
    }
    return res.status(200).clearCookie("accesstoken")
        .json(new APIresponse(200, {},"user loggedout successfully"))
})

const refreshAccessToken = asynchandler(async (req, res) => { 
    const incomingRefreshToken = req.cookies.refreshToken
        || req.body.refreshToken;
    
    if (!incomingRefreshToken) {
        throw new apierror(401,"unauthorized request")
    }

    const decodedtoken=jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = User.findById(decodedtoken?._id)
    
    if (!user) {
        throw new apierror(401,"Invalid refresh token")
    }
     
    if (incomingRefreshToken !== user?.refreshToken){
        throw new apierror(401," refresh token expired or used" )
    }

    try {
        const options = {
            httpOnly: true,
            secure:true
        }
    
        await generateAccessAndRefreshTokens(user._id)
    
        return res.status(201)
            .cookie("accesstoken", accesstoken,options)
            .cookie("refreshtoken", refreshToken, options)
            .json(
                new APIresponse(
                    200,
                    { accesstoken, refreshToken: refreshAccessToken },
                    "access token refreshed successfully"
                )
            )
    } catch (error) {
        throw new apierror(401,error?.message ||"invalid refresh token " )
    }

})

const changecurrentpassword = asynchandler(async (req, res) => {
    const { oldpassword, newpassword} = req.body
    
    
    const user = await User.findById(User.findByIdAndUpdate(req.user?._id))
    const ispasswordcorrect = await isPasswordCorrect(oldpassword)
    
    if (!ispasswordcorrect) {
        throw new apierror(400,"Invalid old password")
    }

    user.password = newpassword
    await user.save({validateBeforeSave:false})
    return res.status(200)
        .json(new APIresponse(200, {}, "new password changed successfully "))
    
        
    
}) 


const getcurrentuser = asynchandler(async (req, res) => { 
    return res.status(200)
        .json(200, req.user, "current user fetched successfully")
})


const updateaccountdetails = asynchandler(async (req, res) => {
    const { fullname, email } = req.body
    if (!fullname && !email) {
        throw new apierror(400,"all field are required")
    }
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email: email,
                
            }
        },
        {new:true}
    ).select("--password  ")

    return res.status(200)
        .json(new APIresponse
            (200, user, "account details updated successfully")
        )
    
})


const updateuseravatar = asynchandler(async (req, res) => {  
    // req.files used with multer
    const avatarlocalpath = req.file?.path
    if (!avatarlocalpath) {
        throw new apierror(400,"avatar file is missing")
    }




    const avatar = await uploadOnCloudinary(avatarlocalpath)
    

    if (!avatar.url) {
        throw new apierror(400,"error while uploading on avatar ")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("--password  ")

    return res.status(200).json(
        new APIresponse(200, {},"avatar updated")
    )

})

const updateusercoverimage = asynchandler(async (req, res) => { 
    // req.files used with multer
    const coverimagelocalpath = req.file?.path
    if (!coverimagelocalpath) {
        throw new apierror(400," cover image file is missing")
    }

    const  coverimage= await uploadOnCloudinary(coverimagelocalpath)

    if (!coverimage.url) {
        throw new apierror(400,"error while uploading  coverimage ")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverimage:coverimage.url
            }
        },
        {new:true}
    ).select("--password  ")

    return res.status(200).json(
        new APIresponse(200, {},"coverimage updated")
    )

})


const getuserchannelprofile = asynchandler(async (req, res) => { 
    const { username } = req.params
    if (!username) {
        throw new apierror(401,"username missing")
    }
    // const user=User.find({username})

    //using aggregation pipeline
    const channel = await User.aggregate([
        {
            $match: {
                username:username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "channel",
                as:"subscribers"
            }
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "subscriber",
                as:"subscribed_to"
            }
        },
        {
            $addFields: {
                subscriberscount: {
                    $size:"$subscribers"
                },
                channels_subscribed_to_count: {
                    $size:"$subscribed_to"
                },
                is_subscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"],
                            then: true,
                            else:false
                        }
                    }
                },
                
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscriberscount:1,
                channels_subscribed_to_count:1,
                is_subscribed:1,
                avatar:1,
                coverimage:1,
                email:1,
            }
        }
    ])

    if (!channel?.length) {
        throw new apierror(401,"channel dont exist")
    }

    return res.status(200)
        .json(
            new APIresponse(200, channel[0], "user channel fetched successfully")
    )
})

const getwatchhistory = asynchandler(async (req, res) => { 
    const user = await User.aggregate([
        {
            $match: {    
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar:1
                                        
                                    }

                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first:"owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200)
        .json(
            new APIresponse(
                200,
                user[0].watchHistory,
                "watch history fetched successfully"
            )
        )
})




export {
    registeruser,
    loginuser,
    logoutuser,
    changecurrentpassword,
    getcurrentuser,
    updateaccountdetails,
    updateuseravatar,       
    updateusercoverimage,
    getuserchannelprofile,
    getwatchhistory 
}