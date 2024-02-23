const express = require('express');
const response = require('../response');
const { fish } = require('../models');
const { Op } = require('sequelize');

module.exports = {
    // get all data fish 
    fishGetAll: async (req, res) => {
        try {
            const getFish = await fish.findAll({
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            response(200, getFish, 'Success get data Fish', res);
        } catch (error) {
            console.error(error);
            response(400, null, "Internal Server Error", res);
        }
    },

    fishGetAllByName: async (req, res) => {
        try {
            const getFish = await fish.findAll({
                attributes: ['id','name']
            });

            response(200, getFish, 'Success get data Fish', res);
        } catch (error) {
            console.error(error);
            response(400, null, "Internal Server Error", res);
        }
    },

    // get fish with paginated 
    fishGetAllPaginated: async(req,res) => {
        // get page from request 
        const page = parseInt(req.query.page) || 1;

        // data per page 
        const pageSize = 5;
        const offset = (page - 1) * pageSize;
        try {
            // find all fish on db 
            const getFish = await fish.findAll({
                limit: pageSize,
                offset: offset,
                order: [
                    ['createdAt', 'DESC']
                ]
            });

             // get total data 
             const totalData = await fish.count();

             // get total page 
             const totalPages = Math.ceil(totalData/pageSize);

             // responses 
            const responses = {
                data: getFish,
                currentPages: page,
                totalPages: totalPages
            };
            return response(200, responses, 'Success get data Fish', res);
        } catch (error) {
            console.log("error", error);
            return response(400, null, "Internal Server Error", res);
        }
    },

    // get fish by name 
    fishGetByName: async(req,res) => {
        try {
            const {name} = req.query;

            // get all fish by name on request 
            const getFish = await fish.findAll({
                where: {
                    name: {
                        [Op.like]: `%${name}%` //use operator like to search teks
                    }
                }
            });

            if (getFish.length > 0) {
                return response(200, getFish, "Success get data Fish", res);
            } else{
                return response(404, null, "Data not found", res);
            }
        } catch (error) {
            console.log(error)
            return response(500, null, "Internal Server Error", res);
        }
    },

    // get fish by id
    fishGetById: async (req, res) => {
        try {
            // get id by params
            const id = req.params.id;

            // find data by id 
            const fishId = await fish.findByPk(id);

            // condition if fish id is available
            if (!fishId) {
                return response(404, null, "Fish data not found!", res);
            } else {
                return response(200, fishId, `Successs get specific data fish with id ${id}`, res);
            }
        } catch (error) {
            console.log(error);
            response(400, null, "Internal Server Error!", res);
        }
    },

    fishPost: async (req, res) => {
        try {
            // simpan data dari requset pada variable 
            const {name, min_price, max_price} = req.body;

            // check data must be filled
            if (!name || !min_price || !max_price) {
                return response(400, null, "Missing required data", res);
            };


            // check type of data must be valid
            if (typeof name !== 'string' || !Number.isInteger(min_price) || !Number.isInteger(max_price)) {
                return response(400, null, "Invalid data type provided", res);
            };

            // Post ke database
            const newFish = await fish.create ({
                name,
                min_price,
                max_price
            });
            // return response
            response(200, newFish, "Success created new data", res);
        } catch (error) {
            console.log(error);
            response(400, null, "Internal Server Error", res);
        }
    },

    fishUpdateById: async (req, res) => {
        try {
            // get id where fish will updated 
            const id = req.params.id;

            // get field db from req 
            const {name, min_price, max_price} = req.body;

            // check data must be filled
            if (!name || !min_price || !max_price) {
                return response(400, null, "Missing required data", res);
            };


            // check type of data must be valid
            if (typeof name !== 'string' || !Number.isInteger(min_price) || !Number.isInteger(max_price)) {
                return response(400, null, "Invalid data type provided", res);
            };

            // updated data to db 
            await fish.update(req.body, {
                where: {
                    id: id
                }
            });

            // save to new variable
            const fishUpdated = await fish.findByPk(id);

            // conditional for response
            if (!fishUpdated) {
                return response(404, null, "Fish not Found!", res);
            }else{
                return response(200, fishUpdated, "Success Update Data", res);
            }
        } catch (error) {
            console.log(error);
            response(400, null, "Internal Server Error", res);
        }
    },

    fishDelete: async(req, res) => {
        try {
            // get fish id from params
            const id = req.params.id;
            
            // check id must be filled not null
            if (!id) {
                return response(404, null, "Data Not Found!", res);
            };

            // check id on db 
            const idFish = await fish.findByPk(id);

            // check id must be available on db
            if (!idFish) {
                return response(404, null, "Data Not Found!", res);
            };
            
            // process delete data
            await fish.destroy({
                where: {
                    id
                }
            })

            response(200, null, "Success Delete Data", res);
        } catch (error) {
            console.log(error);
            response(400, null, "Internal Server Error", res);
        }
    }
}