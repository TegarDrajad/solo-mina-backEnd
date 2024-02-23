const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

const usersRouter = require('./routes/usersRouters');
const usersLogin = require('./routes/authRouters');
const fishRouter = require('./routes/fishRouters');
const custRouter = require('./routes/custRouters');
const priceRouter = require('./routes/priceRouters');
const recapRouter = require('./routes/recapRouters');

dotenv.config();

// middleware
app.use(express.json())
app.use(bodyParser.json())
app.use(cors());

//Routing all users
app.use('/api/v1/users', usersRouter)

//Routing Authentication
app.use('/api/v2/auth', usersLogin)

// Routing fish
app.use('/api/v3/fish', fishRouter)

// Routing customer 
app.use('/api/v4/cust', custRouter)

// Routing price by customers
app.use('/api/v5/price', priceRouter)

// Routing recap 
app.use('/api/v6/recap', recapRouter)

const port = process.env.PORT
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})












// app.get("/mahasiswa", (req, res) => {
//   const sql = "SELECT * FROM mahasiswa"
//   db.query(sql, (err, fields) => {
//     if (err) throw err
//     // console.log(fields)
//     response(200, fields, "Berhasil get data mahasiswa", res)
//   })

// })

// app.get("/mahasiswa/:nim", (req, res) => {
//   const nim = req.params.nim
//   const sql = `SELECT * FROM mahasiswa WHERE nim = ${nim}`
//   db.query(sql, (err, fields) => {
//     // console.log(fields)
//     if (err) throw err
//     response(200, fields, "Berhasil get spesific data by Id", res)
//   })
// })

// app.post("/mahasiswa/post", (req, res) => {
//   const {nim, nama_lengkap, kelas, alamat} = req.body

//   const sql = `INSERT INTO mahasiswa (nim, nama_lengkap, kelas, alamat) VALUES (${nim}, '${nama_lengkap}', '${kelas}', '${alamat}')`

//   db.query(sql, (err, fields) => {
//     if (err) response(500, "invalid", "error", res)

//     if (fields?.affectedRows) {
//       const data = {
//         isSucces: fields.affectedRows,
//         id: fields.insertId
//       }
//       response(200, data, "Data Added Succesfully", res)
//     }
//     // console.log(fields)
//   })
// })

// app.put("/mahasiswa/put", (req, res) => {
//   const {nim, nama_lengkap, kelas, alamat} = req.body
//   const sql = `UPDATE mahasiswa SET nama_lengkap = '${nama_lengkap}', kelas = '${kelas}', alamat = '${alamat}' WHERE nim = ${nim}`

//   db.query(sql, (err, fields) => {
//     console.log(fields)
//     if (err) response(500, "Invalid", "error", res)
//     if (fields?.affectedRows) {
//       const data = {
//         isSucces: fields.affectedRows,
//         message: fields.message,
//       }
//       response(200, data, "Update data succesfully", res)
//     } else {
//       response(404, "User Not Found", "error", res)
//     }
//   })
// })

// app.delete("/mahasiswa/delete", (req, res) => {
//   const {nim} = req.body 
//   const sql = `DELETE FROM mahasiswa WHERE nim = ${nim}`

//   db.query(sql, (err, fields) => {
//     if(err) response(500, "Invalid", "error", res)
//     if (fields?.affectedRows) {
//       const data = {
//         isDelete: fields.affectedRows,
//       }
//       response(200, data, "Delete data succesfully", res)
//     } else {
//       response(404, "User Not Found", "error", res)
//     }
//   })
// })

