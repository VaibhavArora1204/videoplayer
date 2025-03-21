import { Router } from "express";
import { loginuser, logoutuser, registeruser,refreshAccessToken, changecurrentpassword, getcurrentuser, updateaccountdetails, updateuseravatar, updateusercoverimage, getuserchannelprofile, getwatchhistory} from "../controllers/user.controller.js";
import { upload } from "../middlerwares/multer.middleware.js";


const router = Router();
router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverimage",
            maxCount: 1,

        }
    ]),
    registeruser
);

router.route('/login').post(loginuser);

//secured routes


router.route('/logout').post(verifyJWT,logoutuser);

router.route('/refresh-token').post(refreshAccessToken)

router.route('/change-password').post(verifyJWT, changecurrentpassword)

router.route('/current-user').get(verifyJWT, getcurrentuser)

router.route('/update-account').post(verifyJWT, updateaccountdetails)

router.route('/avatar').patch(verifyJWT, upload.single("avatar"), updateuseravatar)

router.route('/cover-image').post(verifyJWT, upload.single("/coverimage"),updateusercoverimage)

// when params is used
router.route('/c/:username').get(verifyJWT, getuserchannelprofile)

router.route('/history').get(verifyJWT, getwatchhistory)



export default router;

// import { Router } from 'express';
// import { registeruser } from '../controllers/user.controller.js';  // Import your controller function
// import { upload } from '../middlewares/multer.middleware.js';  // Import your multer middleware

// const router = Router();

// // router.route('/register').post(
// //   upload.fields([
// //     {
// //       name: 'avatar',
// //       maxCount: 1,
// //     },
// //     {
// //       name: 'coverimage',
// //       maxCount: 1,
// //     }
// //   ]),
// //   registeruser  // The function that handles the user registration
// // );

// router.route('api/v1/users/register').post((req, res) => {
//   console.log('Request received:', req.body);  // Log the request body
//   res.status(200).json({ message: 'Route works!' });
// });


// export default router;
