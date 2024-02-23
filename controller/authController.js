const express = require('express');
const response = require('../response');
const db = require('../connection');
const jwt = require('jsonwebtoken');
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
  }
 
};

