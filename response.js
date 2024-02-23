// const response = (statusCode, data, message, res) => {
//     res.status(statusCode).json({
//         payload: {
//             status_code: statusCode,
//             datas: data,
//             message: message
//         },
//         pagination:{
//             prev: "",
//             next: "",
//             max: ""
//         }
//     })
// }

const response = (statusCode, data, message, res) => {
    res.status(statusCode).json({
        status_code: statusCode,
        payload: data,
        message: message,
    }); 
}


module.exports = response