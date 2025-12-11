import { Router } from 'express';
import CustumerController from '../controllers/customerController.js';
import authenticate from '../middlewares/authenticate.js';
 
const routes = new Router();

routes.route('/')
    .post( CustumerController.create)
    .get( CustumerController.search);

routes.route('/:id')
    .get( CustumerController._populate, CustumerController.fetch)
    .put( CustumerController._populate, CustumerController.update)
    .delete( CustumerController.delete);

export default routes;