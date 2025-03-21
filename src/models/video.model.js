import mongoose,{Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoschema = new Schema({
    videofile: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,   // from cloudinary
        required: true,
    },
    views: {
        type: Number,
        default:0,
    },
    isPublished: {
        type: Boolean,
        default:1,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref:"user"
    },
},{timestamps:true})       

        

export const Video=mongoose.model("Video",videoschema)