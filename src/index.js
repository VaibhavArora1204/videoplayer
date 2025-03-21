import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

const app = express();
    
dotenv.config({
    path:'./env'
})


connectDB()
    .then((value) => {
        app.listen(process.env.PORT , () => {
            console.log(`server is running at port : ${process.env.PORT}`);
        })
    })
    .catch((error) => {
        console.log(`mongo connection failed at index.js   ${error}`);
        
    })













// const app = express()
// ; (async ()=> {
//     try {
//         await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
//         app.on("error", (error) => {
//             console.log(error);
//             throw error
//         })
//         app.listen(process.env.PORT, () => {
//             console.log(`app is listening on the port ${process.env.PORT}`);

//         })

//     } catch (error) {
//         console.log("FAILED", error);
//         throw error
        
//     }
// })()



// const app = express()
// ; (async () => { 
//     try {
//         await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
//         app.on("error", error => {
//             console.log("error");
//             throw error
            
//         })
//         app.listen(process.env.PORT, () => {
//             console.log(`app is listening on port ${process.env.PORT}`);
            
//         })
//     } catch (error) {
//         console.log(error);
//         throw error
//     }
// })()