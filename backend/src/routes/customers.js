// routes/customerRoutes.js
import express from "express";
import customerController from '../controllers/customerController.js';

//Router
const router = express.Router();

//Select - Insert
router.route("/")
    .get(customerController.getCustomers)
    .post(customerController.insertCustomer);

//Delete - Update - Get by ID
router.route("/:id")
    .get(customerController.getCustomerById)
    .put(customerController.updateCustomer)
    .delete(customerController.deleteCustomer);



//Export
export default router;