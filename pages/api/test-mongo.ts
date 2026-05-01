import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
    res.status(200).json({ message: 'MongoDB connected successfully!' });
    console.log('MongoDB connected successfully!');
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to MongoDB' });
    console.error('Failed to connect to MongoDB:', error);
  }
}
