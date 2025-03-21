import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUDNAME, 
        api_key:process.env.CLOUDINARY_API_KEY , 
        api_secret: process.env.CLOUDINARY_API_SECRET
});
 
const uploadOnCloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) return NULL
        //upload file on cloudinary
        const res=await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto"
        })
        //file upload  success
        // console.log("file upload success", response.url);
        fs.unlinkSync(localfilepath);
        return res;
    } catch (error) {
        fs.unlinkSync(localfilepath)  // remove temporarily saved file as upload failed
        console.log("upload failed");
        
    }
}

export {uploadOnCloudinary}




// cloudinary.v2.uploader.upload("",
//     { public_id: "olympic flag" },
//     function (error, result) { console.log(result); });
