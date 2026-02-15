import {
    createOrderService,
    getOrdersService,
    getOrderByIdService,
    updateOrderStatusService,
    deleteOrderService,
} from '../services/order.Service.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validations/order.validation.js'; // Import the validation schemas

export const createOrder = async (req, res) => {
    try {
        // 1. Validate input
        const { error } = createOrderSchema.validate(req.body);
        if (error) {
            console.log("❌ Validation Error:", error.details[0].message);
            return res.status(400).json({ message: error.details[0].message });
        }

        const orderData = {
            ...req.body,
            client: req.clientTk.id, // Añadir el ID del cliente desde el token
        };
        const order = await createOrderService(orderData);
        res.status(201).json(order);
    } catch (error) {
        console.error("❌ Error in createOrder controller:", error.message);
        res.status(500).json({ message: "Error creating order", error: error.message });
    }
};

export const getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy, sortOrder, search } = req.query;
        const result = await getOrdersService({ page, limit, sortBy, sortOrder, search });
        res.json(result);
    } catch (error) {
        console.error("❌ Error in getOrders controller:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await getOrderByIdService(id);
        res.json(order);
    } catch (error) {
        console.error("❌ Error in getOrderById controller:", error.message);
        res.status(404).json({ message: "Order not found", error: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        // 1. Validate input
        const { error } = updateOrderStatusSchema.validate(req.body);
        if (error) {
            console.log("❌ Validation Error:", error.details[0].message);
            return res.status(400).json({ message: error.details[0].message });
        }

        const { id } = req.params;
        const { status } = req.body;
        const updatedOrder = await updateOrderStatusService(id, status);
        res.json(updatedOrder);
    } catch (error) {
        console.error("❌ Error in updateOrderStatus controller:", error.message);
        res.status(500).json({ message: "Error updating order status", error: error.message });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteOrderService(id);
        res.json(result);
    } catch (error) {
        console.error("❌ Error in deleteOrder controller:", error.message);
        res.status(500).json({ message: "Error deleting order", error: error.message });
    }
};
