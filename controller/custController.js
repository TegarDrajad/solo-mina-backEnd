const express = require('express')
const response = require('../response')
const { customers } = require('../models')
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

module.exports = {

    // post data cust to database 
    custPost: async (req, res) => {
        try {
            const {name, contact, address} = req.body;

            // check data must not null 
            if (!name || !contact || !address) {
                return response(400, null, "Missing reqired data", res);
            }

            // check data by type data
            if (typeof name !== 'string' || typeof contact !== 'string' || typeof address !== 'string') {
                return response(400, null, "Invalid data types. All data must be strings.", res);
            }

            // check contact cannot input length with > 12 
            if (contact.length > 12) {
                return response(400, null, "contact cannot over 12 characters.", res)
            }

            // start contact from zero
            const paddedContact = contact ? contact.padStart(12, '0').slice(-12) : undefined;
            // console.log(paddedContact);

            // create to database 
            const newCust = await customers.create ({
                name,
                contact: paddedContact,
                address
            });

            return response(200, newCust, "Success created data", res);
        } catch (error) {
            console.log(error);
            return response(400, null, "Internal Server Error", res);
        }
    },

    custGetAll: async (req, res) => {
        try {

            // find all cust on db 
            const getCust = await customers.findAll({
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            return response(200, getCust, 'Success get data Customers', res);
        } catch (error) {
            console.log(error);
            return response(400, null, "Internal Server Error", res);
        }
    },

    custGetAllByPaginated: async(req,res) => {
        // get page from request 
        const page = parseInt(req.query.page) || 1;

        // data per page 
        const pageSize = 5;
        const offset = (page - 1) * pageSize;
        try {
            // findAll customer on db 
            const getCust = await customers.findAll({
                limit: pageSize,
                offset: offset,
                order: [
                    ['createdAt', 'DESC']
                ],
            });

            // get total data 
            const totalData = await customers.count();

            // get total page 
            const totalPages = Math.ceil(totalData/pageSize);

            // responses 
            const responses = {
                data: getCust,
                currentPages: page,
                totalPages: totalPages
            };

            return response(200, responses, 'Success get Customers Data', res);
        } catch (error) {
            console.log(error);
            return response(400, null, "Internal Server Error", res);
        }
    },

    custGetOnlyName: async (req,res) => {
        try {
            // find all cust on db only name 
            const getCustName = await customers.findAll({
                order: [
                    ['name', 'ASC']
                ],
                attributes: ['id','name']
            });

            response(200, getCustName, 'Success get data Customers', res);
        } catch (error) {
            console.log(error);
            return response(400, null, "Internal Server Error", res);
        }
    },

    custGetById: async (req, res) => {
        try {
            // get id from params 
            const id = req.params.id;

            // if id is null
            if (!id) {
                return response(400, null, "Invalid request. 'id' parameter is missing.", res);
            }

            // find data by id 
            const custData = await customers.findByPk(id);

            // condition if id is not defind 
            if (!custData) {
                return response(404, null, "Customer data not found!", res);
            } else {
                return response(200, custData, `Success get specific data customer with id ${id}`, res);
            }
        } catch (error) {
            console.log(error);
            response(400, null, "Internal Server Error!", res);
        }
    },

    custUpdateById: async (req, res) => {
        try {
            // get id from req params 
            const id = req.params.id;

            // cek apakah ada data di db sesuai id
            const custId = await customers.findByPk(id);

            if (!custId) {
                return response(404, null, "Data with the provided ID not found", res);
            } else {
                // get field db from req
                const {name, contact, address} = req.body;
    
                // check data must be filled 
                if (!name || !contact || !address) {
                    return response(400, null, "Missing required data", res);
                };
    
                // check type data must be valid 
                if (typeof name !== "string" || typeof contact !== "string" || typeof address !== "string") {
                    return response(400, null, "Invalid data type provided", res);
                }
    
                // check contact cannot input length with > 12 
                if (contact.length > 12) {
                    return response(400, null, "contact cannot over 12 characters.", res)
                }
    
                // start contact from zero
                const paddedContact = contact ? contact.padStart(12, '0').slice(-12) : undefined;
    
                // updated data to db 
                await customers.update(
                    {
                        name,
                        contact: paddedContact,
                        address
                    },
                    {
                        where: {
                            id: id
                        }
                    }
                );
    
                // get data after update 
                const custUpdated = await customers.findByPk(id);
    
                // return response after update 
                response(200, custUpdated, "Success Update Data", res);
            }

        } catch (error) {
            console.log(error);
            response(400, null, "Internal Server Error", res)
        }
    },

    custDelete: async(req, res) => {
        try {
            // get id from params 
            const id = req.params.id;

            // check id not null 
            if (!id) {
                return response(404, null, "Data Not Found!", res);
            };

            // check on db
            const idCust = await customers.findByPk(id);

            // check if data not found
            if (!idCust) {
                return response(404, null, "Data Not Found!", res);
            };

            // process delete data on db 
            await customers.destroy({
                where: {
                    id
                }
            });

            response(200, null, "Success Delete Data", res);
        } catch (error) {
            console.log(error)
            response(400, null, "Internal Server Error", res);
        }
    },

    custGetByName: async(req, res) => {
        try {
            const {name} = req.query;

            // get all customers by name on request 
            const getCust = await customers.findAll({
                where: {
                    name: {
                        [Op.like]: `%${name}%` //use operator like to search teks
                    }
                }, 
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            if (getCust.length > 0) {

                const responses = {
                    data: getCust
                };

                return response(200, responses, "Success get data customers", res);
            } else{
                return response(404, null, "Data not found", res);
            }
        } catch (error) {
            console.log(error)
            return response(400, null, "Internal Server Error", res);
        }
    }
}