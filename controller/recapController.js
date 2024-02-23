const express = require('express');
const response = require('../response');
const { recap } = require('../models');
const { customers } = require('../models')
const { fish } = require('../models')
const { users } = require('../models')
const { PriceByCustomer } = require('../models');
const { where } = require('sequelize');

module.exports = {
    
    // post data recap to db
    recapPost: async (req, res) => {
        try {
            const {customerId, fishId, priceByCustomersId, usersId, price, total_product, total_price, status, notes} = req.body;

            // checking data must be filled 
            if (!customerId || !fishId || !priceByCustomersId || !usersId || !price || !total_product || !status) {
                return response(400, null, "Missing reqired data", res);
            };

            // checking type data 
            if (typeof customerId !== "number" ||
                typeof fishId !== "number" ||
                typeof priceByCustomersId !== "number" ||
                typeof usersId !== "number" ||
                typeof price !== "number" ||
                typeof total_product !== "number" ||
                typeof total_price !== "number" ||
                typeof notes !== "string" 
                ) {
                    return response(400, null, "Invalid data types.", res);
            };

            // check enum type data 
            const validStatusType = ['Paid', 'Not Yet Paid', 'Not Yet Paid Off'];
            if (!validStatusType.includes(status)) {
                return response(400, null, "Invalid data types of status", res);
            };

            // validations data on database 
            const customerExists = await customers.findByPk(customerId);
            const fishExists = await fish.findByPk(fishId);
            const priceByCustomerExists = await PriceByCustomer.findByPk(priceByCustomersId, {
                attributes: ['id', 'customerId', 'fishId', 'price', 'createdAt', 'updatedAt']
            });
            const usersExists = await users.findByPk(usersId);

            // validation data must be filled
            if (customerExists === null || fishExists === null || usersExists === null || priceByCustomerExists === null) {
                return response(400, null, "Invalid data Customer, Fish, Users, or Price", res);
            };

            // validation relations table
            if (priceByCustomerExists.customerId !== customerId || priceByCustomerExists.fishId !== fishId) {
                return response(400, null, "Invalid relationship between customer, fish, and priceByCustomers.", res);
            };

            // post to db 
            const newRecap = await recap.create({
                customerId,
                fishId,
                priceByCustomersId,
                usersId,
                price,
                total_product,
                total_price,
                status,
                notes
            });
            return response(200, newRecap, "Success created new data", res);
        } catch (error) {
            console.log("error", error);
            return response(400, null, "Internal Server Error", res);
        }
    },

    recapGetALl: async(req, res) => {
        try {
            // find all recap on db 
            const getRecap = await recap.findAll({
                include: [{
                    model: customers,
                    as: 'customer',
                    attributes: ['name']
                },
                {
                    model: fish,
                    as: 'fish',
                    attributes: ['name']
                },
                {
                    model: users,
                    as: 'users',
                    attributes: ['full_name']
                }],
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            return response(200, getRecap, "Success get data Recap", res);
        } catch (error) {
            console.log("error", error);
            return response(500, null, "Internal Server Error", res);
        }
    },

    recapGetByPage: async(req, res) => {
        // get page from request 
        const page = parseInt(req.query.page) || 1;
        // data per page 
        const pageSize = 5;
        const offset = (page - 1) * pageSize;

        try {
            // get data
            const getRecap = await recap.findAll({
                limit: pageSize,
                offset: offset,
                attributes: [`id`, `customerId`, `fishId`, `usersId`, `priceByCustomersId`, `price`, `total_product`, `total_price`, `status`, `notes`, `createdAt`, `updatedAt`],
                order: [['createdAt', 'DESC']],
            });

            // get total data 
            const totalCount = await recap.count();

            // get total page 
            const totalPages = Math.ceil(totalCount / pageSize);

            // response 
            const responses = {
                data: getRecap,
                currentPages: page,
                totalPages: totalPages
            };

            response(200, responses, `Success get data Recap page ${page}`, res);
        } catch (error) {
            console.log(error);
            return response(500, null, "Internal Server Error", res);
        }
    },

    recapGetByCustomerId: async (req, res) => {
        try {
            const id =  req.params.id;

            // get page from request 
            const page = parseInt(req.query.page) || 1;
            // data per page 
            const pageSize = 5;
            const offset = (page - 1) * pageSize;

            // get all customers has recap
                const recapByCust = await recap.findAll({
                    limit: pageSize,
                    offset: offset,
                    attributes: [`id`, `customerId`, `fishId`, `usersId`, `priceByCustomersId`, `price`, `total_product`, `total_price`, `status`, `notes`, `createdAt`, `updatedAt`],
                    where: {
                        customerId: id
                    },
                    order: [
                        ['createdAt', 'DESC']
                    ],
                });

            // cek if recap by cust is not null 
            if (recapByCust.length > 0) {
                // get total data 
                const totalCount = await recap.count({
                    where:{
                        customerId: id
                    }
                });

                // get total page 
                const totalPages = Math.ceil(totalCount / pageSize);

                // response 
                const responses = {
                    data: recapByCust,
                    currentPages: page,
                    totalPages: totalPages
                };

                return response(200, responses, `Success get data Recap by Customer page ${page}`, res);
            }else{
                return response(404, null, "Data is not defined!", res);
            }
        } catch (error) {
            console.log("Err",error);
            return response(500, null, "Internal Server Error", res);
        }
    },

    recapGetById: async (req, res) => {
        try {
            const id = req.params.id;
    
            // get all recap by id 
            const recapDataId = await recap.findAll({
                where: {
                    id: id
                },
                include: [{
                    model: customers,
                    as: 'customer',
                    attributes: ['name']
                },
                {
                    model: fish,
                    as: 'fish',
                    attributes: ['name']
                }]
            });
    
            if (recapDataId.length > 0) {
                return response(200, recapDataId, `Success get data with id ${id}`, res);
            }else{
                return response(404, null, "Data is not defined", res);
            }
        } catch (error) {
            console.log("error", error);
            return response(500, null, "Internal Server Error", res);
        }
    },

    recapUpdate: async (req, res) => {
        try {
            // get id from params 
            const id = req.params.id;

            // get data by id 
            const recapData = await recap.findByPk(id);

            // check recapData must be filled
            if (recapData !== null) {
                // get data by params 
                const {customerId, fishId, priceByCustomersId, usersId, price, total_product, total_price, status, notes} = req.body;

                // checking data must be filled 
                if (!customerId || !fishId || !priceByCustomersId || !usersId || !price || !total_product || !status) {
                    return response(400, null, "Missing required data", res);
                };

                // checking type data 
                if (typeof customerId !== "number" ||
                    typeof fishId !== "number" ||
                    typeof priceByCustomersId !== "number" ||
                    typeof usersId !== "number" ||
                    typeof price !== "number" ||
                    typeof total_product !== "number" ||
                    typeof total_price !== "number" ||
                    typeof notes !== "string" 
                    ) {
                        return response(400, null, "Invalid data types.", res);
                };

                // check enum type data 
                const validStatusType = ['Paid', 'Not Yet Paid', 'Not Yet Paid Off'];
                if (!validStatusType.includes(status)) {
                    return response(400, null, "Invalid data types of status", res);
                };

                // validations data on database 
                const customerExists = await customers.findByPk(customerId);
                const fishExists = await fish.findByPk(fishId);
                const priceByCustomerExists = await PriceByCustomer.findByPk(priceByCustomersId);
                const usersExists = await users.findByPk(usersId);

                // validation data must be filled
                if (customerExists === null || fishExists === null || usersExists === null || priceByCustomerExists === null) {
                    return response(400, null, "Invalid data Customer, Fish, Users, or Price", res);
                };

                // validation relations table
                if (priceByCustomerExists.customerId !== customerId || priceByCustomerExists.fishId !== fishId) {
                    return response(400, null, "Invalid relationship between customer, fish, and priceByCustomers.", res);
                };

                // update data on db 
                await recap.update(
                    {
                        customerId, fishId, priceByCustomersId, usersId, price, total_product, total_price, status, notes
                    },
                    {
                        where: {
                            id:id
                        }
                    }
                );

                // get data after updating 
                const recapUpdated = await recap.findByPk(id);

                // return response 
                return response(200, recapUpdated, "Success Updated Data Recap", res);
            }else{
                return response(404, null, "Recap is Not Defind", res);
            }
        } catch (error) {
            console.log("error", error);
            return response(500, null, "Internal Server Error", res);
        }
    },

    recapDelete: async (req, res) => {
        try {
            // get id from params 
            const id = req.params.id;

            // check id not null 
            if (!id) {
                return response(404, null, "Id is not Defined!", res);
            };

            // check on db 
            const recapData = await recap.findByPk(id);
            // console.log(recapData)

            // check if data is available 
            if (recapData !== null) {
                // proses deleted data 
                await recap.destroy({
                    where: {
                        id
                    }
                });
                return response(200, null, `Success Deleted Data with Id ${id}`, res);
            }else{
                return response(404, null, `Data with Id ${id} not found!`, res);
            }
        } catch (error) {
            console.log("error", error);
            return response(500, null, "Internal Server Error", res);
        }
    }

   
}