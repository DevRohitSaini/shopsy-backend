import Customer from "../models/Customer.js";

class AuthController {

    login = async (req, res, next) => {
        const {
            email,
            password,
        } = req.body;

        try {
            const customer = await Customer.findOne({ email });
            if (!customer) return res.status(400).json({ message: "Invalid email" });

            const isMatch = await customer.matchPassword(password);
            if (!isMatch) return res.status(400).json({ message: "Invalid password" });

            const accessToken = customer.generateToken();

            return res.status(200).json({
                isSuccess: true,
                token: accessToken,
                data: customer,
            });

        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ isSuccess: false, message: err.message });
            } else {
                console.error('Error:', err);
                res.status(500).json({ isSuccess: false, message: 'Internal server error' });
            }
        }
    }

    register = async (req, res, next) => {
        const filter = req.body;

        if (!filter.password) {
            filter.password = "123456"
        }

        const existingCustomer = await Customer.findOne({ 'email': req.body.email });

        if (existingCustomer) {
            const err = new Error('Email already exist.');
            err.status = 401;
            return next(err);
        } else {
            let newCustomer = new Customer(filter);
            try {
                const customer = await newCustomer.save();
                const accessToken = customer.generateToken();

                return res.status(200).json({
                    isSuccess: true,
                    token: accessToken,
                    data: customer,
                });
            } catch (err) {
                if (err.status) {
                    res.status(err.status).json({ isSuccess: false, message: err.message });
                } else {
                    console.error('Error:', err);
                    res.status(500).json({ isSuccess: false, message: 'Internal server error' });
                }
            }
        }
    }

    // check email existence and send opt
    checkCredentials = async (req, res, next) => {
        const {
            email
        } = req.body;

        try {
            const customer = await Customer.findOne({
                email: email,
            }).exec();

            if (!customer) {
                const err = new Error('Please verify your credentials.');
                err.status = 401;
                return next(err);
            }

            return res.status(200).json({
                isSuccess: true
            });

        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ isSuccess: false, message: err.message });
            } else {
                console.error('Error:', err);
                res.status(500).json({ isSuccess: false, message: 'Internal server error' });
            }
        }
    }

    resetPassword = async (req, res, next) => {
        const {
            email,
            password,
        } = req.body;

        try {
            const customer = await Customer.findOne({
                email: email,
            }).exec();

            if (!customer) {
                const err = new Error('Invalid email.');
                err.status = 401;
                return next(err);
            }

            let jsonData = {
                "password": password
            }
            let updatedCustomer = Object.assign(customer, jsonData);
            await updatedCustomer.save();

            return res.status(200).json({
                isSuccess: true
            });

        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ isSuccess: false, message: err.message });
            } else {
                console.error('Error:', err);
                res.status(500).json({ isSuccess: false, message: 'Internal server error' });
            }
        }
    }

}

export default new AuthController();