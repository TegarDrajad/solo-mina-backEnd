const express = require('express')
const response = require('../response')
const db = require('../connection')
const { users } = require('../models')
const { recap } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {

    // Post data to database

    usersPost: async (req, res) => {
        try {
            const {username, password, full_name, role } = req.body

            // Memeriksa kehadiran data yang dibutuhkan
            if (!username || !password || !full_name || !role) {
                return response(400, null, "Missing required data", res);
            };

            // Memeriksa apakah full_name mengandung angka
            if (/\d/.test(full_name)) {
                return response(400, null, "Full name cannot contain numbers", res);
            };

            //memeriksa username tidak boleh sama dengan yang lainnya 
            const existingUsers = await users.findOne({
                where: {username}
            });
            // console.log(existingUsers)
            if (existingUsers !== null) {
                return response(400, null, "Username already exists", res);
            }
            
            const newUsers = await users.create ({
                username,
                password,
                full_name,
                role
            });

            response(200, newUsers, "Succes created data", res)
        } catch (error) {
            return response(400, null, "Internal Server Error", res)
        }
    },

    usersGet: async (req, res) => {
        try {
            const getUsers = await users.findAll({
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            return response(200, getUsers, "Succes get data", res)
        } catch (error) {
            return response(400, null, "Internal Server Error", res);
        }
    },

    usersGetAllPaginated: async(req,res) => {
         // get page from request 
         const page = parseInt(req.query.page) || 1;

         // data per page 
         const pageSize = 5;
         const offset = (page - 1) * pageSize;

         try {
            // find all users on db 
            const getUsers = await users.findAll({
                limit: pageSize,
                offset: offset,
                order: [
                    ['createdAt', 'DESC']
                ],
            });

            // get total data 
            const totalData = await users.count();

            // get total page 
            const totalPages = Math.ceil(totalData/pageSize);

            // responses 
            const responses = {
                data: getUsers,
                currentPages: page,
                totalPages: totalPages
            };

            return response(200, responses, 'Success get data Users', res);
         } catch (error) {
            console.log("error", error);
            return response(400, null, "Internal Server Error", res);
         }
    },

    usersById: async (req, res) => {
        try {
            const id = req.params.id

            const usersId = await users.findByPk(id);
            
            if (!usersId) {
                return response(404, null, "Users Not Found!", res);
            }else{
                const responses = {
                    data: usersId
                };

                return response(200, responses, "Succes get specific data", res);
            }

        } catch (error) {
            console.log(error);
            return response(400, null, "Internal Server Error", res);
        }
    },

    usersUpdate: async (req, res) => {
        try {
            const id = req.params.id;
            const {username, password, full_name, role} = req.body;
            // console.log('Password:', password);

            // hash password has change , before updated must bcrypt first
            if (password && !password.startsWith('$2b$')) {
                const hashedPassword = await bcrypt.hash(password, 10);
                req.body.password = hashedPassword;
            }

             // Memeriksa apakah full_name mengandung angka
            if (/\d/.test(full_name)) {
                return response(400, null, "Full name cannot contain numbers", res);
            };
            
            await users.update(req.body, {
                where: {
                    id: id
                }
            });

            const newUsers = await users.findByPk(id);

            if (!newUsers) {
                return response(404, null, "Users Not Found!", res);
            }else{
                return response(200, newUsers, "Succes Update Data", res);
            }

        } catch (error) {
            console.log(error);
            return response(400, null, "Internal Server Error", res);
        }
    },

    usersDelete: async (req, res) => {
        try {
            const id = req.params.id

            // cek id apakah ada 
            const idUsers = await users.findByPk(id);

            if (!idUsers) {
                return response(404, null, "Users Not Found!", res);
            }

            // proses hapus data
            await users.destroy({
                where: {
                    id
                }
            })

            return response(200, null, "Succes Delete Data", res);

        } catch (error) {
            console.log(error);
            return response(400, null, "Internal Server Error", res);
        }
    },

    usersGetBytoken: async (req, res) => {
        const token = req.params.token;

        if (!token) {
            return response(401, null, "Token Not Found", res);
        }

        // verifikasi jwt authentikasi pengguna cek token aktif atau tidak
        jwt.verify(token, process.env.JWT_SECRET, async(err, decodedUser) => {
            if (err) {
                return response(403, null, "Token is Invalid or Expired", res);
            }
            console.log(decodedUser)

            try {
                const user = await users.findByPk(decodedUser.id.id);

                if (!user || user.length === 0) {
                    return response(404, null, "Users Not Found", res);
                }    

                response (200, user, "Succes get data users", res);
            } catch (error) {
                console.log(error);
                return response(400, null, "Internal Server Error", res);
            }
        })
    }
}

 
