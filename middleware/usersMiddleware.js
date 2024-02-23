const jwt = require('jsonwebtoken');
const response = require('../response');
const { users } = require('../models')

// module.exports ={

exports.authMiddleware = async (req, res, next) => {
        // if pada header dimasukkan token atau tidak 

        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // console.log(token)

        // jika token tidak terisi pada header 

        if (!token) {
            return next(response(401, null, "You not logged in or token is not defind", res));
        }

        // Decoded Verifikasi token 
        let decoded;
        try {
           decoded = await jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            console.log(error)
            return next(response(401, null, "Token is invalid!", res))
        }
        // console.log(decoded)
        
        // ambil data user berdasarkan token
        const userId = await users.findByPk(decoded.id.id);
        // console.log(userId);

        if (!userId) {
            return response(401, null, "User not found", res);
        }

        req.users = userId;

        next()
    }
// }