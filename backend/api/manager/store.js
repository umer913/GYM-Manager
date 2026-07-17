import dbConnect from '../../lib/mongodb';
import Product from '../../models/Product';
import Order from '../../models/Order';
import { authenticate, authorizeRoles } from '../../utils/auth';

export default async function handler(req, res) {
  await dbConnect();

  authenticate(req, res, () => {
    authorizeRoles('Manager')(req, res, async () => {
      const { method } = req;

      switch (method) {
        case 'GET':
          try {
            const { type } = req.query;

            if (type === 'orders') {
              const orders = await Order.find()
                .populate('user', 'name email phone')
                .populate('items.product')
                .sort({ createdAt: -1 });
              return res.status(200).json({ success: true, orders });
            }

            const products = await Product.find().sort({ createdAt: -1 });
            return res.status(200).json({ success: true, products });
          } catch (error) {
            console.error('Store GET error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        case 'POST':
          try {
            const { name, description, price, category, images, stock, expectedDelivery } = req.body;
            if (!name || !price) {
              return res.status(400).json({ success: false, message: 'Name and price are required' });
            }

            const product = await Product.create({
              name,
              description: description || '',
              price,
              category: category || 'General',
              images: images || [],
              stock: stock ?? 0,
              expectedDelivery: expectedDelivery || '3-5 business days',
            });

            return res.status(201).json({ success: true, product });
          } catch (error) {
            console.error('Store POST error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        case 'PUT':
          try {
            const { _id, name, description, price, category, images, stock, expectedDelivery, isActive } = req.body;
            if (!_id) {
              return res.status(400).json({ success: false, message: 'Product ID is required' });
            }

            const product = await Product.findById(_id);
            if (!product) {
              return res.status(404).json({ success: false, message: 'Product not found' });
            }

            if (name !== undefined) product.name = name;
            if (description !== undefined) product.description = description;
            if (price !== undefined) product.price = price;
            if (category !== undefined) product.category = category;
            if (images !== undefined) product.images = images;
            if (stock !== undefined) product.stock = stock;
            if (expectedDelivery !== undefined) product.expectedDelivery = expectedDelivery;
            if (isActive !== undefined) product.isActive = isActive;

            await product.save();

            return res.status(200).json({ success: true, product });
          } catch (error) {
            console.error('Store PUT error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        case 'DELETE':
          try {
            const { _id } = req.body;
            if (!_id) {
              return res.status(400).json({ success: false, message: 'Product ID is required' });
            }

            const product = await Product.findById(_id);
            if (!product) {
              return res.status(404).json({ success: false, message: 'Product not found' });
            }

            await Product.findByIdAndDelete(_id);

            return res.status(200).json({ success: true, message: 'Product deleted successfully' });
          } catch (error) {
            console.error('Store DELETE error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        default:
          return res.status(405).json({ success: false, message: 'Method not allowed' });
      }
    });
  });
}
