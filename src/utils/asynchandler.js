const asynchandler = (reqchandler) => {  
    (req, res, next) => {
        Promise.resolve(reqchandler(req)).catch((err)=>next(err))
    }
}


export { asynchandler }


// const asynchandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             sucess: false,
//             message: err.message,

//         })
//     }
// }