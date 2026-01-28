import { Router } from 'express';
import OrderController from '../controllers/orderController.js';
import authenticate from '../middlewares/authenticate.js';
 
const routes = new Router();

//public routes
routes.route('/create').post(OrderController.createOrder);
routes.route('/:orderID').get(OrderController._populate, OrderController.fetchOrderByID)

//authenticated routes
routes.route('/myorder/:user').get(authenticate, OrderController.fetchOrderByUser);


export default routes;