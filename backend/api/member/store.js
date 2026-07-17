import dbConnect from '../../lib/mongodb';
import Product from '../../models/Product';
import Order from '../../models/Order';
import { authenticate, authorizeRoles } from '../../utils/auth';

export default async function handler(req, res) {
  await dbConnect();

  authenticate(req, res, () => {
    authorizeRoles('member')(req, res, async () => {
      const { method } = req;

      switch (method) {
        case 'GET':
          try {
            const { type } = req.query;

            if (type === 'my-orders') {
              const orders = await Order.find({ user: req.user.userId })
                .populate('items.product')
                .sort({ createdAt: -1 });
              return res.status(200).json({ success: true, orders });
            }

            const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
            return res.status(200).json({ success: true, products });
          } catch (error) {
            console.error('Member store GET error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        case 'POST':
          try {
            const { items, shippingAddress, contactPhone, notes } = req.body;

            if (!items || !items.length) {
              return res.status(400).json({ success: false, message: 'No items in order' });
            }

            // Validate and calculate total
            let totalAmount = 0;
            const orderItems = [];

            for (const item of items) {
              const product = await Product.findById(item.productId);
              if (!product || !product.isActive) {
                return res.status(404).json({ success: false, message: `Product ${item.productId} not found or unavailable` });
              }
              if (product.stock < (item.quantity || 1)) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
              }

              const quantity = item.quantity || 1;
              totalAmount += product.price * quantity;

              orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity,
                image: product.images?.[0] || '',
              });
            }

            const order = await Order.create({
              user: req.user.userId,
              items: orderItems,
              totalAmount,
              shippingAddress: shippingAddress || '',
              contactPhone: contactPhone || '',
              notes: notes || '',
              status: 'pending',
            });

            // Decrease stock
            for (const item of orderItems) {
              await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
            }

            const populatedOrder = await Order.findById(order._id)
              .populate('items.product');

            return res.status(201).json({ success: true, order: populatedOrder });
          } catch (error) {
            console.error('Member store POST error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        default:
          return res.status(405).json({ success: false, message: 'Method not allowed' });
      }
    });
  });
}
