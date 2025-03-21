import mongoose,{Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"



const userschema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,   //to enable searching (optimizing)
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index:true,
    },
    avatar: {
        type: String,   // cloudinary url
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    coverimage: {
        type: String,
        
    },
    watch_history: [
        {
            type: Schema.Types.ObjectId,
            ref:"video"
        }
    ],
    password: {
        type: String,   // cloudinary url
        required: [true,'password is required'],
        unique: true,
    },
    refreshToken: {
        type: String,   
    },
}, {
    timestamps:true
    
})

userschema.pre("save", async function (next) {
    if (this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password, 10)
    next()
})

userschema.method.isPasswordCorrect=async function (password) {
    await bcrypt.compare(password,this.password)
}
userschema.method.generateAcessToken = function () {
    jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname,
    }, process.env.ACCESS_TOKEN_SECRET
    , {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}
userschema.method.generateRefreshToken = function () {
    jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname,
    }, process.env.REFRESH_TOKEN_SECRET
    , {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}

export const User = mongoose.model("User", userschema)





// import mongoose from 'mongoose';
// const categoryschema = new mongoose.Schema({
//   categoryname:{
//     type:String,
//     required:true, 
//     unique:true,
//     lowercase:true,
//   },
  
// }, { timestamps: true });
// export const category= mongoose.model('category', subtodoschema);
// // stored as categories 