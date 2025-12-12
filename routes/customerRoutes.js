import { Router } from 'express';
import CustumerController from '../controllers/customerController.js';
import authenticate from '../middlewares/authenticate.js';
 
const routes = new Router();

routes.route('/')
    .post(authenticate, CustumerController.create)
    .get(authenticate, CustumerController.search);

routes.route('/:id')
    .get(authenticate, CustumerController._populate, CustumerController.fetch)
    .put(authenticate, CustumerController._populate, CustumerController.update)
    .delete(authenticate, CustumerController.delete);

export default routes;