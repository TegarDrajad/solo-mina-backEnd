const express = require('express');
const response = require('../response');
const db = require('../connection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const signToken = id => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}
const { users } = require('../models')

module.exports = {  
  //  Post Login 
  login: async(req, res) => {
    try {
      // fungsi validasi jika username tidak terisi
      
      if (!req.body.username || !req.body.password) {
        return response(400, null, 'Username and Password are required.' ,res);
      }
      
      // cek apakah username sudah ada pada database dan password sudah benar
      const usersData = await users.findOne({where: {username: req.body.username}})

      if (!usersData || !(await usersData.CorrectPassword(req.body.password, usersData.password))) {
        return response(401, null, 'Invalid Your Password', res);
      }

      // cek jika tidak terjadi error maka kita tampilkan token pada response 
      const token = signToken({
        id: usersData.id,
        role: usersData.role,
        full_name: usersData.full_name
      });

      return res.status(200).json({
        status: "Success",
        message: "Login Berhasil!",
        token: token,
        role: usersData.role,
        full_name: usersData.full_name,
      });
      
    } catch (error) {
      console.log(error)      
    }
  },

  forgotPassword: async(req, res) => {
    try {
      // get username and new password from request 
      const username = req.body.username;
      const newPassword = req.body.newPassword;
      const repeatNewPassword = req.body.repeatNewPassword;

      // cek username if not null
      if (username !== "") {
        const usersData = await users.findOne({
          where: {
            username: username
          }
        })

        // cek usersData is not null
        if (!usersData) {
          return response(404, null, `Users With username '${username}' is not defind`, res);
        }

        // cek new password and repeat new password must be same 
        if (newPassword === repeatNewPassword) {
          // bcrypt password 
          const hashedPassword = await bcrypt.hash(newPassword, 10);

          // create variable new password 
          const newUsersData = {
            username: usersData.username,
            password: hashedPassword,
            full_name: usersData.full_name,
            role: usersData.role
          }

          // update data
          await users.update(newUsersData, {
            where: {
              id: usersData.id
            }
          });

          const newUsersPassword = await users.findByPk(usersData.id);

          if (newUsersPassword !== "") {
            return response(200, newUsersPassword, "Succes Update New Password", res);
          }else{
            return response(400, null, "Cannot update new password", res);
          }
        }else{
          return response(400, null, "Password is not matched", res);
        }
      }
    } catch (error) {
      console.log(error);
      return response(400, null, "Internal Server Error", res);
    }
  }
 
};

