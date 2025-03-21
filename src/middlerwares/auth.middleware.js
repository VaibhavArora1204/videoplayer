import { apierror } from "../utils/apierror";
import { asynchandler } from "../utils/asynchandler";
import jwt from "jsonwebtoken";

const verifyJWT = asynchandler (async (req,res,next)=>{
    try {
        const token=req.cookies?.accesstoken || req.header("authorisation")?.replace("Bearer ", "")
        if (!token) {
            throw new apierror(401, "unauthorisation request")
        }
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken)
            .select("--password --refresh token")
    // discuss on the frontend here
        if (!user) {
            throw new apierror(401, "invalid access token")
        }

        req.user = user;

        next();
    } catch (error) {
        throw new apierror(401,error?.message || "invalid access token")
    }
})