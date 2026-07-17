import dbConnect from '../../lib/mongodb';
import Order from '../../models/Order';
import { authenticate, authorizeRoles } from '../../utils/auth';

export default async function handler(req, res) {
  await dbConnect();

  authenticate(req, res, () => {
    authorizeRoles('Manager')(req, res, async () => {
      if (req.method !== 'PUT') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
      }

      try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
          return res.status(400).json({ success: false, message: 'Order ID and status are required' });
        }

        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
          return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.status = status;
        await order.save();

        return res.status(200).json({ success: true, message: `Order ${status}`, order });
      } catch (error) {
        console.error('Order status error:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
      }
    });
  });
}
