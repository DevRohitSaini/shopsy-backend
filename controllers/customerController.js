import Custumer from '../models/Customer.js';

class CustumerController {


	_populate = async (req, res, next) => {
		// This is middleware to populate customer from ID parameter
		if (req.params.id && req.params.id != 'newuser') {
			const {
				id,
			} = req.params;

			try {
				const custumer = await
					Custumer.findById(id)
						.exec();

				if (!custumer) {
					const err = new Error('User not found.');
					err.status = 404;
					return next(err);
				}
				req.custumer = custumer;
				next();
			} catch (err) {
				console.log(err);
				next(err);
			}
		} else {
			res.status(500).json({ isSuccess: false, message: 'ID not found' });
		}
	}

	search = async (req, res, next) => {
		let filter = {};
		let sort = {};

		filter.status = 'active';
		if (req.query.status) {
			filter.status = req.query.status;
		}
		// Pagination mode
		const { page, limit } = req.query;
		const pageNum = parseInt(page) || 1;
		const limitNum = parseInt(limit) || 10;
		const skip = (pageNum - 1) * limitNum;

		try {

			const [results, itemCount] = await Promise.all([
				Custumer.find(filter).sort(sort).limit(limitNum).skip(skip).exec(),
				Custumer.countDocuments(filter),
			]);

			res.json({
				isSuccess: true,
				object: 'list',
				page: {
					...req.query,
					totalPages: Math.ceil(itemCount / limitNum),
					totalItems: itemCount,
				},
				data: results,
			});
		} catch (err) {
			console.log('err=>', err);
			next(err);
		}
	}

	fetch = async (req, res) => {
		const custumer = req.custumer;

		if (!custumer) {
			return res.sendStatus(404);
		}

		res.status(200).json({
			isSuccess: true,
			data: custumer
		});
	}

	create = async (req, res, next) => {
		const filter = req.body;
		if (!filter.password) {
			filter.password = "123456"
		}

		const existingCustumer = await Custumer.findOne({ 'email': req.body.email });
		if (existingCustumer) {

			const err = new Error('Email already exist.');
			err.status = 401;
			return next(err);

		} else {

			let newCustumer = new Custumer(filter);
			try {
				const custumer = await newCustumer.save();
				res.status(201).json({
					isSuccess: true,
					data: custumer
				});
			} catch (err) {
				if (err.status) {
					res.status(err.status).json({ isSuccess: false, message: err.message });
				} else {
					console.error('Error:', err);
					res.status(500).json({ isSuccess: false, message: err.message });
				}
			}
		}
	}

	update = async (req, res, next) => {
		let custumer = req.body;
		let updatedCustumer = Object.assign(req.custumer, custumer);
		try {
			const savedCustumer = await updatedCustumer.save();

			res.status(200).json({
				isSuccess: true,
				data: savedCustumer
			});
		} catch (err) {
			if (err.status) {
				res.status(err.status).json({ isSuccess: false, message: err.message });
			} else {
				console.error('Error:', err);
				res.status(500).json({ isSuccess: false, message: err.message });
			}
		}
	}

	delete = async (req, res, next) => {
		console.log('Deleting customer with id:', req.params.id);
		try {
			const deleted = await Custumer.findByIdAndDelete(req.params.id);

			if (!deleted)
				return res.status(404).json({ message: "Customer not found" });

			res.json({ message: "Customer deleted successfully" });

		} catch (err) {
			res.status(500).json({ message: err.message });
		}
	}


	passwordReset = async (req, res, next) => {
		try {
			const custumer = req.custumer;
			if (!custumer) return res.status(401).json({ isSuccess: false, message: "Customer not found" });

			const { oldPassword, newPassword } = req.body;

			const isMatch = await custumer.matchPassword(oldPassword);
			if (!isMatch) return res.status(401).json({ isSuccess: false, message: "Old password does not match" });

			custumer.password = newPassword;
			await custumer.save();
			res.json({ isSuccess: true, message: "Password reset successfully" });

		} catch (err) {
			res.status(500).json({ message: err.message });
		}
	}

}
export default new CustumerController();