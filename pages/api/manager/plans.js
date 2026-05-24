import dbConnect from '../../../lib/mongodb';
import Plan from '../../../models/Plan';
import { authenticate, authorizeRoles } from '../../../utils/auth';

export default async function handler(req, res) {
  await dbConnect();

  authenticate(req, res, () => {
    authorizeRoles('Manager')(req, res, async () => {
      const { method } = req;

      switch (method) {
        case 'GET':
          try {
            let plans = await Plan.find({}).sort({ createdAt: 1 });
            
            // Auto-seed default plans if empty
            if (plans.length === 0) {
              const defaultPlans = [
                {
                  name: 'Basic Plan',
                  price: 3000,
                  duration: '1 Month',
                  allowsTrainer: false,
                  features: ['Gym Floor Access', 'Locker Room Access', 'Standard Cardio Zone']
                },
                {
                  name: 'Premium Plan',
                  price: 8000,
                  duration: '1 Month',
                  allowsTrainer: true,
                  features: ['Personal Trainer Assigned', 'VIP Gym & Spa Access', 'Diet & Nutrition Guide', 'Unlimited Group Classes']
                }
              ];
              await Plan.insertMany(defaultPlans);
              plans = await Plan.find({}).sort({ createdAt: 1 });
            }

            return res.status(200).json({ success: true, plans });
          } catch (error) {
            console.error('Fetch plans error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        case 'POST':
          try {
            const { name, price, duration, allowsTrainer, features } = req.body;
            if (!name || price === undefined || !duration) {
              return res.status(400).json({ success: false, message: 'Name, price, and duration are required' });
            }

            // Ensure features is an array of strings
            let featuresArray = [];
            if (Array.isArray(features)) {
              featuresArray = features.map(f => f.trim()).filter(Boolean);
            } else if (typeof features === 'string') {
              featuresArray = features.split(',').map(f => f.trim()).filter(Boolean);
            }

            const plan = await Plan.create({
              name,
              price: Number(price),
              duration,
              allowsTrainer: !!allowsTrainer,
              features: featuresArray
            });

            return res.status(201).json({ success: true, message: 'Plan created successfully', plan });
          } catch (error) {
            console.error('Create plan error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        case 'PUT':
          try {
            const { id } = req.query;
            const { name, price, duration, allowsTrainer, features } = req.body;

            const planId = id || req.body._id;
            if (!planId) {
              return res.status(400).json({ success: false, message: 'Plan ID is required' });
            }

            const plan = await Plan.findById(planId);
            if (!plan) {
              return res.status(404).json({ success: false, message: 'Plan not found' });
            }

            if (name) plan.name = name;
            if (price !== undefined) plan.price = Number(price);
            if (duration) plan.duration = duration;
            if (allowsTrainer !== undefined) plan.allowsTrainer = !!allowsTrainer;
            
            if (features !== undefined) {
              let featuresArray = [];
              if (Array.isArray(features)) {
                featuresArray = features.map(f => f.trim()).filter(Boolean);
              } else if (typeof features === 'string') {
                featuresArray = features.split(',').map(f => f.trim()).filter(Boolean);
              }
              plan.features = featuresArray;
            }

            await plan.save();

            return res.status(200).json({ success: true, message: 'Plan updated successfully', plan });
          } catch (error) {
            console.error('Update plan error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        case 'DELETE':
          try {
            const { id } = req.query;
            const planId = id || req.body._id;
            if (!planId) {
              return res.status(400).json({ success: false, message: 'Plan ID is required' });
            }

            const plan = await Plan.findById(planId);
            if (!plan) {
              return res.status(404).json({ success: false, message: 'Plan not found' });
            }

            await Plan.findByIdAndDelete(planId);
            return res.status(200).json({ success: true, message: 'Plan deleted successfully' });
          } catch (error) {
            console.error('Delete plan error:', error);
            return res.status(500).json({ success: false, message: 'Server error', error: error.message });
          }

        default:
          return res.status(405).json({ success: false, message: 'Method not allowed' });
      }
    });
  });
}
