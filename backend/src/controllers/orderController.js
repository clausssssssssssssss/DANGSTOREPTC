import Order from "../models/Order.js";

const ordersController = {};

/** POST /api/orders
 *  Crea la Order en Mongo una vez que PayPal devolvió status=COMPLETED
 */
ordersController.createOrder = async (req, res) => {
  const { items, total, paypalOrderID, paypalStatus } = req.body;
  try {
    const order = new Order({
      user: req.user.id,
      items,
      total,
      status: paypalStatus === "COMPLETED" ? "COMPLETED" : "PENDING",
      paypal: { orderID: paypalOrderID, captureStatus: paypalStatus }
    });
    await order.save();
    return res.status(201).json(order);
  } catch (err) {
    console.error("CreateOrder error:", err);
    return res.status(400).json({ message: "No se pudo crear la orden" });
  }
};

/** GET /api/orders
 *  Historial de órdenes del usuario
 */
ordersController.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name price");
    return res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json({ message: "Error al obtener órdenes" });
  }
};

export default ordersController;
