import Custumer from '../models/Customer.js';

class CustumerController {
	

	_populate = async (req, res, next) => {
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
			next();
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
					totalPages:  Math.ceil(total / limitNum),
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

      let newCustumer = new User(filter);
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
					res.status(500).json({ isSuccess: false, message: 'Internal server error' });
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
			console.log('err=>', err);
			next(err);
		}
	}

	delete = async (req, res, next) => {
		if (!req.custumer) {
			return res.sendStatus(403);
		}

		try {
			await req.custumer.findByIdAndDelete(req.params.id)
			res.status(200).json({
				isSuccess: true
			});
		} catch (err) {
			console.log('err=>', err);
			next(err);
		}
	}

}
export default new CustumerController();