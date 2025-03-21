import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, ch) {
        cb(null,'/public/temp')
    },
    filename: function (req, file, ch) {
        // const uniquesuffix = Date.now() + '-' + Math.round
        //     (Math.round.random() + 1E9)
        // cb(null, file.fieldname + '-' + uniquesuffix)
        cb(null, file.originalname )

    }
})

export const upload = multer({
    storage,    
})