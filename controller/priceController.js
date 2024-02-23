const response = require('../response')
const { PriceByCustomer } = require('../models');
const { customers } = require('../models');
const { fish } = require('../models');
const { INTEGER } = require('sequelize');
const { Op } = require('sequelize');

module.exports = {
    // post data to db 
    pricePost: async (req, res) => {
        try {
            const {customerId, fishId, price} = req.body;

            // check data must be filled
            if (!customerId || !fishId || !price) {
                return response(400, null, "Missing reqired data", res);
            }

            // check data must be same with the type of data
            if (typeof customerId !== "number" || typeof fishId !== "number" || typeof price !== "number") {
                return response(400, null, "Invalid data types. All data must be Integer.", res);
            }

            // cek id_cust and id_fish must be exist in db
            const checkIdCustomer = await customers.findByPk(customerId);
            const checkIdFish = await fish.findByPk(fishId);
            
            // cek if customer and fish 
            if (checkIdCustomer.length === 0 || checkIdFish.length === 0) {
                return response(404, null, "Customer or Fish not found", res);
            }

            // get minimum and maximum price from fish 
            const minPrice = checkIdFish.min_price;
            const maxPrice = checkIdFish.max_price;

            // conditional for entry price 
            if (price < minPrice || price > maxPrice) {
                return response(400, null, "Invalid price. Price must be between min and max price for the fish.", res );
            };

            // check data ada yang sama atuu tidak 
            const getPrice = await PriceByCustomer.findAll({
                where: {
                    customerId: customerId,
                    fishId: fishId
                }
            });

            // post on db 
            if (getPrice.length === 0) {
                const postPrice = await PriceByCustomer.create ({
                    customerId,
                    fishId,
                    price
                });
                
                return response(200, postPrice, "Success created data", res);
            }else{
                return response(400, null, "Data already exists", res);
            };
        } catch (error) {
            console.log(error);
            return response(400, null, "Internal Server Error", res);
        }
    },

    priceGetAll: async (req, res) => {
        try {
            // find all price by customer on db 
            const getPrice = await PriceByCustomer.findAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                include: [{
                    model: customers,
                    as: "customer",
                    attributes: ['name']
                },{
                    model: fish,
                    as: "fish",
                    attributes: ['name']
                }]
            });

            return response(200, getPrice, 'Success get data Price by Customers', res);
        } catch (error) {
            console.log("error", error);
            return response(400, null, "Internal Server Error", res);
        }
    },

    priceGetByPaginated: async(req,res) => {
        // get page from request 
        const page = parseInt(req.query.page) || 1;

        // data per page 
        const pageSize = 5;
        const offset = (page - 1) * pageSize;

        try {
            // find all price by customer on db 
            const getPrice = await PriceByCustomer.findAll({
                limit: pageSize,
                offset: offset,
                order: [
                    ['createdAt', 'DESC']
                ],
                include: [{
                    model: customers,
                    as: "customer",
                    attributes: ['name']
                },{
                    model: fish,
                    as: "fish",
                    attributes: ['name']
                }]
            });

            // get total data 
            const totalData = await PriceByCustomer.count();

            // get total page 
            const totalPages = Math.ceil(totalData/pageSize);

            // responses 
            const responses = {
                data: getPrice,
                currentPages: page,
                totalPages: totalPages
            };

            return response(200, responses, 'Success get data Price by Customers', res);
        } catch (error) {
            console.log("error", error);
            return response(400, null, "Internal Server Error", res);
        }
    },

    priceGetByCustomerId: async (req, res) => {
        try {
            const id = req.params.id;

            // get all customers by id customer on request 
            const prices = await PriceByCustomer.findAll({
                where: {
                    id: id
                },
                include: [{
                    model: customers,
                    as: "customer",
                    attributes: ['name']
                },{
                    model: fish,
                    as: "fish",
                    attributes: ['name']
                }]
            });
            // console.log(prices);

            if (prices.length === 0) {
                return response(404, null, "Data is not defined!", res);
            }else{
                return response(200, prices, "Success getting data", res);
            }
        } catch (error) {
            console.log(error);
            response(400, null, "Internal Server Error", res);
        }
    },

    priceGetByCustAndFish: async (req, res) => {
        try {
            // get id data 
            const custId = req.params.custId;
            const fishId = req.params.fishId;

            // checking cust id and fish id cannot null
            if (!custId || !fishId) {
                return response(404, null, "Data is not defined!", res);
            };

            // get price by cust id and fish id 
            const prices = await PriceByCustomer.findAll({
                attributes: ['id', 'customerId', 'fishId', 'price', 'createdAt', 'updatedAt'],
                where: {
                    customerId: custId,
                    fishId: fishId
                }
            });

            if (prices.length > 0) {
                return response(200, prices, "Success getting data price", res);
            }else{
                response(404, null, "Data is not defined!", res);
            }
        } catch (error) {
            console.log(error);
            response(500, null, "Internal Server Error", res);
        }
    },

    priceUpdateData: async (req,res) => {
        try {
            const id = req.params.id;

            // get data on db by id 
            const priceId = await PriceByCustomer.findByPk(id, {
                attributes: ['id', 'customerId', 'fishId', 'price', 'createdAt', 'updatedAt']
            });

            // proces conditional 
            if (priceId.length === 0) {
                return response(404, null, "Data with the provided ID not found", res);
            }else{
                // get data from request
                const {customerId, fishId, price} = req.body;

                // check data must be filled 
                if (!customerId || !fishId || !price) {
                    return response(400, null, "Missing required data", res);
                };

                // check type of data must be valid
                if (typeof customerId !== "number" || typeof fishId !== "number" || typeof price !== "number") {
                    return response(400, null, "Invalid data type provided", res);
                };

                // check customer id and fish id must be filled
                const checkIdCustomer = await customers.findByPk(customerId);
                const checkIdFish = await fish.findByPk(fishId);

                // cek if customer and fish 
                if (!checkIdCustomer || !checkIdFish) {
                    return response(404, null, "Customer or Fish not found", res);
                };

                 // get minimum and maximum price from fish 
                const minPrice = checkIdFish.min_price;
                const maxPrice = checkIdFish.max_price;

                // conditional for entry price 
                if (price < minPrice || price > maxPrice) {
                    return response(400, null, "Invalid price. Price must be between min and max price for the fish.", res );
                };
                
                // update data on db 
                await PriceByCustomer.update(
                    {
                        customerId,
                        fishId,
                        price
                    },
                    {
                        where: {
                            id:id
                        }
                    }
                );

                // get data after update 
                const priceUpdated = await PriceByCustomer.findByPk(id, {
                    attributes: ['id', 'customerId', 'fishId', 'price', 'createdAt', 'updatedAt']
                });

                // return response after update
                response(200, priceUpdated, "Success Updated Data", res);
            }
        } catch (error) {
            console.log("error", error);
            response(400, null, "Internal Server Error", res);
        }
    },

    priceByCustDelete: async(req, res) => {
        try {
            // get id from params 
            const id = req.params.id;

            // check id not null 
            if (!id) {
                return response(404, null, "Data Not Found!", res);
            };

            // check on db 
            const priceToBeDeleted = await PriceByCustomer.findByPk(id, {
                attributes: ['id', 'customerId', 'fishId', 'price', 'createdAt', 'updatedAt']
            });

            // check if data not found
            if (!priceToBeDeleted) {
                return response(404, null, "Data Not Found!", res);
            };

            // process deleted data 
            await PriceByCustomer.destroy({
                where: {
                    id
                }
            });

            response(200, null, 'Seccess Delete Data', res);
        } catch (error) {
            console.log(error);
            response(400, null, "Internal Server Error", res);
        }
    },

    priceGetByName: async(req, res) => {
        // paginations
        const page = parseInt(req.query.page) || 1;
        const pageSize = 5;
        const offset = (page - 1) * pageSize;

        try {
            // get name from params
            const {name} = req.query;
            // console.log(name)

            // get data customer by name 
            const getCustName = await customers.findAll({
                where: {
                    name: {
                        [Op.like]: `%${name}%` //use operator like to search teks
                    }
                }
            });
            // console.log(getCustName);
            let custId = 0;

            // check getcustname must available
            if (getCustName.length === 0) {
                return response(404, null, "Customer not found", res);
            }else{
                // get id from getCustName
                getCustName.forEach(customer => {
                    // console.log(customer.id)
                    custId = customer.id;
                });
                // get price by cust name 
                const prices = await PriceByCustomer.findAll({
                    where: {
                        customerId: custId
                    },
                    limit: pageSize,
                    offset: offset,
                    include: [{
                        model: customers,
                        as: "customer",
                        attributes: ['name']
                    },{
                        model: fish,
                        as: "fish",
                        attributes: ['name']
                    }], 
                    order: [
                        [
                            'createdAt', 'DESC'
                        ]
                    ]
                });
                
                // check prices
                if (prices.length === 0) {
                    return response(404, null, "No Prices found for this customer", res);
                }else{
                    // get length price by cust for paginated 
                    const priceCustLength = await PriceByCustomer.findAll({
                        where: {
                            customerId: custId
                        }
                    });

                    // get total data from prices
                    const totalData = await priceCustLength.length;
    
                    // get total page
                    const totalPages = Math.ceil(totalData / pageSize);
    
                    const responses = {
                        data: prices,
                        currentPages: page,
                        totalPages: totalPages
                    };
                    return response(200, responses, "Succes getting prices for this customer", res);
                };
            };
        } catch (error) {
            console.log(error);
            response(400, null, "Internal Server Error", res);
        }
    }
}