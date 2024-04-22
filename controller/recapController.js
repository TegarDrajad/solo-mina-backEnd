const express = require('express');
const response = require('../response');
const { recap } = require('../models');
const { customers } = require('../models')
const { fish } = require('../models')
const { users } = require('../models')
const { PriceByCustomer } = require('../models');
const { where } = require('sequelize');
const { Op } = require('sequelize');

module.exports = {
    
    // post data recap to db
    recapPost: async (req, res) => {
        try {
            const {customerId, fishId, priceByCustomersId, usersId, price, total_product, total_price, status, notes, remainingAmount} = req.body;

            // console.log(req.body.remainingAmount)

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
                typeof notes !== "string" ||
                typeof remainingAmount !== "number"
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

            // validation remainingAmount cannot > total price
            if (remainingAmount > total_price) {
                return response(400, null, "Invalid, Remaining Amount cannot over than total price", res);
            };

            // validation remainingAmount must be not null if status not paid and not yet paid 
            if (status === "Not Yet Paid" || status === "Not Yet Paid Off") {
                if (remainingAmount === 0) {
                    return response(400, null, "Remaining Amount cannot be null for this status", res);
                }
            }

            console.log(remainingAmount)

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
                notes,
                remainingAmount
            });
            console.log(newRecap)
            return response(200, newRecap, "Success created new data", res);
        } catch (error) {
            console.log("error", error);
            return response(400, null, "Internal Server Error", res);
        }
    },

    recapGet: async(req, res) => {
        // get page from request param
        const page = parseInt(req.query.page) || 1;

        // data per page
        const pageSize = 5;
        const offset = (page - 1) * pageSize;

        // get filter parameteers from query
        const {customer, startDate, endDate, status} = req.query;
        console.log(req.query)

        let where = {};

        if (customer !== undefined) {
            where[`$customer.name$`] = { [Op.like]: `%${customer}%`};
        }
        if (startDate !== undefined && endDate !== undefined) {
            // start date set hours
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            // set end date hours
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            where['createdAt'] = {
                [Op.between]: [start, end]
            };
        }
        
        if (status !== undefined) {
            where[`status`] = { [Op.eq]: status}
        }

        // console.log(where)

        try {
            // find all recap on db 
            const getRecap = await recap.findAll({
                limit: pageSize,
                offset: offset,
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
                where,
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            // get total data 
            // const totalData = await getRecap.length;

            const totalData = await recap.count({
                include: [{
                    model: customers,
                    as: 'customer',
                    attributes: ['name']
                }],
                where
            });
            // console.log(getRecap)

            // get total page
            const totalPages = Math.ceil(totalData / pageSize);

            const responses = {
                data: getRecap,
                currentPages: page,
                totalPages: totalPages
            };

            // check get recap length
            if (getRecap.length > 0) {
                return response(200, responses, "Success get data Recap", res);
            }else{
                return response(404, responses, "Data Not Found", res);
            };
            
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
                const {customerId, fishId, priceByCustomersId, usersId, price, total_product, total_price, status, remainingAmount, notes} = req.body;

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
                    typeof notes !== "string" ||
                    typeof remainingAmount !== "number"
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

                // validation remainingAmount cannot > total price
                if (remainingAmount > total_price) {
                    return response(400, null, "Invalid, Remaining Amount cannot over than total price", res);
                };

                 // validation remainingAmount must be not null if status not paid and not yet paid 
                if (status === "Not Yet Paid" || status === "Not Yet Paid Off") {
                    if (remainingAmount === 0) {
                        return response(400, null, "Remaining Amount cannot be null for this status", res);
                    }
                }

                // update data on db 
                await recap.update(
                    {
                        customerId, fishId, priceByCustomersId, usersId, price, total_product, total_price, status, remainingAmount, notes
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
    },

    recapGetTotalPriceDaily: async(req,res) => {
        // total price in the day 
        const today = new Date();
        const startDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
        const endDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        try {
            // get total price of the day
            const totalTodayPrice = await recap.sum('total_price', {
                where: {
                    createdAt: {
                        [Op.between]: [startDay, endDay]
                    }
                }
            });

            // get total price of the day where status
            const getTotalPriceByStatus = async(status, startDay, endDay) => {
                return await recap.sum('total_price', {
                    where: {
                        status: status,
                        createdAt: {
                            [Op.between]: [startDay, endDay]
                        }
                    }
                });
            };

            // get remaining amount of the day
            const totalRemainingAmount = await recap.sum('remainingAmount', {
                where: {
                    createdAt: {
                        [Op.between]: [startDay, endDay]
                    }
                }
            });
            //console.log(totalRemainingAmount)
            
            // total price where status fixed
            // Promise.all digunakan untuk menjalankan kedua pemanggilan fungsi getTotalPriceByStatus secara paralel
            const [totalPriceNotYetPaid, totalPriceNotYetPaidOff] = await Promise.all([
                getTotalPriceByStatus('Not Yet Paid', startDay, endDay),
                getTotalPriceByStatus('Not Yet Paid Off', startDay, endDay)
            ]);
            const totalTodayAllStatus = totalPriceNotYetPaid + totalPriceNotYetPaidOff;
            // console.log(totalTodayAllStatus)

            // already paid operations where status not paid and not paid off
            const alreadyPaid = totalTodayAllStatus - totalRemainingAmount;

            // not yet paid operations
            const notYetPaid = totalTodayAllStatus - alreadyPaid;

            // allready paid fixed include total price all
            const alreadyPaidFixed = totalTodayPrice - notYetPaid;

            const responses = {
                totalTodayPrice: totalTodayPrice,
                notYetPaid: notYetPaid,
                alreadyPaid: alreadyPaidFixed
            }

            return response(200, responses, "Data income today is displayed", res);

        } catch (error) {
            console.log(error)
            return response(404, null, "Data is not defined!", res);
        }
    },

    recapGetTotalPriceMonthly: async(req,res) => {
        // total price in the day 
        const today = new Date();
        const startDay = new Date(today.getFullYear(), today.getMonth(), 2, 0, 0, 0, 0);
        const endDay = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        // console.log(startDay)
        try {
            // get total price of the day
            const totalMonthlyPrice = await recap.sum('total_price', {
                where: {
                    createdAt: {
                        [Op.between]: [startDay, endDay]
                    }
                }
            });

            // get total price of the day where status
            const getTotalPriceByStatus = async(status, startDay, endDay) => {
                return await recap.sum('total_price', {
                    where: {
                        status: status,
                        createdAt: {
                            [Op.between]: [startDay, endDay]
                        }
                    }
                });
            };

            // get remaining amount of the day
            const totalRemainingAmount = await recap.sum('remainingAmount', {
                where: {
                    createdAt: {
                        [Op.between]: [startDay, endDay]
                    }
                }
            });
            //console.log(totalRemainingAmount)
            
            // total price where status fixed
            // Promise.all digunakan untuk menjalankan kedua pemanggilan fungsi getTotalPriceByStatus secara paralel
            const [totalPriceNotYetPaid, totalPriceNotYetPaidOff] = await Promise.all([
                getTotalPriceByStatus('Not Yet Paid', startDay, endDay),
                getTotalPriceByStatus('Not Yet Paid Off', startDay, endDay)
            ]);
            const totalMonthlyAllStatus = totalPriceNotYetPaid + totalPriceNotYetPaidOff;
            // console.log(totalTodayAllStatus)

            // already paid operations where status not paid and not paid off
            const alreadyPaid = totalMonthlyAllStatus - totalRemainingAmount;

            // not yet paid operations
            const notYetPaid = totalMonthlyAllStatus - alreadyPaid;

            // allready paid fixed include total price all
            const alreadyPaidFixed = totalMonthlyPrice - notYetPaid;

            const responses = {
                totalMonthlyPrice: totalMonthlyPrice,
                notYetPaid: notYetPaid,
                alreadyPaid: alreadyPaidFixed
            }

            return response(200, responses, "Data income today is displayed", res);

        } catch (error) {
            console.log(error)
            return response(404, null, "Data is not defined!", res);
        }
    }

   
}