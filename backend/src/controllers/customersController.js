const customerController = {};
import customerModel from "../models/Customer.js";

// Obtener todos los customers
customerController.getCustomers = async (req, res) => {
    try {
        const customers = await customerModel.find();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching customers", error });
    }
};

// Obtener customer por ID
customerController.getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await customerModel.findById(id);

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: "Error fetching customer", error });
    }
};

// Crear customer
customerController.insertCustomer = async (req, res) => {
    try {
        const { name, email, password, dui, isVerified } = req.body;

        if (!name || !email || !password || !dui) {
            return res.status(400).json({ message: "Missing required fields: name, email, password, or dui" });
        }

        const existingCustomer = await customerModel.findOne({ email });
        if (existingCustomer) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const newCustomer = new customerModel({
            name,
            email,
            password,
            dui,
            isVerified: isVerified || false
        });

        await newCustomer.save();
        res.status(201).json({ message: "Customer Added", customer: newCustomer });

    } catch (error) {
        res.status(500).json({ message: "Error creating customer", error });
    }
};

// Eliminar customer
customerController.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await customerModel.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.json({ message: "Customer Deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting customer", error });
    }
};

// Actualizar customer
customerController.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, dui, isVerified } = req.body;

        const updatedCustomer = await customerModel.findByIdAndUpdate(
            id,
            { name, email, password, dui, isVerified },
            { new: true, runValidators: true }
        );

        if (!updatedCustomer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.json({ message: "Customer Updated", customer: updatedCustomer });
    } catch (error) {
        res.status(500).json({ message: "Error updating customer", error });
    }
};

export default customerController;
