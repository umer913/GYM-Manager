// Run: node scripts/seed-store.js
// Seeds 15 gym products into the database

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-manager';

const productSchema = new mongoose.Schema({
  name:           String,
  description:    String,
  price:          Number,
  category:       String,
  images:         [String],
  stock:          Number,
  expectedDelivery: String,
  isActive:       { type: Boolean, default: true },
  createdAt:      { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', productSchema);

const products = [
  {
    name: "Premium Yoga Mat",
    description: "Extra thick 6mm eco-friendly TPE yoga mat with alignment lines. Non-slip surface perfect for yoga, pilates, and stretching exercises.",
    price: 2499,
    category: "Equipment",
    images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop"],
    stock: 50,
    expectedDelivery: "3-5 business days",
  },
  {
    name: "Adjustable Dumbbells Set (2×12.5 kg)",
    description: "Space-saving adjustable dumbbells with quick-change weight dial. Replaces 15 sets of weights. 2.5-12.5 kg per dumbbell.",
    price: 15999,
    category: "Equipment",
    images: ["https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop"],
    stock: 20,
    expectedDelivery: "5-7 business days",
  },
  {
    name: "Whey Protein Isolate 2kg - Chocolate",
    description: "25g protein per serving, 0g sugar, 110 calories. Fast-absorbing whey protein isolate for muscle recovery and growth.",
    price: 5499,
    category: "Supplements",
    images: ["https://images.unsplash.com/photo-1593095948071-474c5cc2c1cf?w=400&h=400&fit=crop"],
    stock: 35,
    expectedDelivery: "2-4 business days",
  },
  {
    name: "Resistance Bands Set (5-Pack)",
    description: "Set of 5 latex resistance bands with varying tension levels (10-50 lbs). Includes carrying bag and exercise guide. Perfect for home workouts.",
    price: 1499,
    category: "Equipment",
    images: ["https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=400&fit=crop"],
    stock: 75,
    expectedDelivery: "3-5 business days",
  },
  {
    name: "Gym Training Gloves",
    description: "Breathable mesh gym gloves with silicone padding and wrist support. Anti-slip design for weightlifting and pull-ups.",
    price: 899,
    category: "Accessories",
    images: ["https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=400&h=400&fit=crop"],
    stock: 100,
    expectedDelivery: "3-5 business days",
  },
  {
    name: "Insulated Shaker Bottle 700ml",
    description: "Double-wall insulated stainless steel shaker bottle. Keeps drinks cold for 24 hours. Leak-proof with mixing grid.",
    price: 1299,
    category: "Accessories",
    images: ["https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&h=400&fit=crop"],
    stock: 60,
    expectedDelivery: "3-5 business days",
  },
  {
    name: "BCAA 2:1:1 Powder 500g - Blueberry",
    description: "Instantized BCAA powder with 5g BCAAs per serving. Supports muscle recovery and reduces fatigue during workouts.",
    price: 2499,
    category: "Supplements",
    images: ["https://images.unsplash.com/photo-1579722820308-d74e5712e2a1?w=400&h=400&fit=crop"],
    stock: 40,
    expectedDelivery: "2-4 business days",
  },
  {
    name: "Jump Rope - Speed Cable",
    description: "Ball-bearing speed jump rope with adjustable 3m steel cable. Foam handles for comfortable grip. Great for cardio and conditioning.",
    price: 699,
    category: "Equipment",
    images: ["https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=400&h=400&fit=crop"],
    stock: 90,
    expectedDelivery: "3-5 business days",
  },
  {
    name: "Gym Drawstring Backpack",
    description: "Lightweight drawstring gym backpack with shoe compartment and zippered pocket. Water-resistant fabric. Available in black.",
    price: 1199,
    category: "Apparel",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop"],
    stock: 45,
    expectedDelivery: "5-7 business days",
  },
  {
    name: "Foam Roller - High Density",
    description: "45cm high-density EVA foam roller for muscle recovery and myofascial release. Relieves muscle tension and improves flexibility.",
    price: 1799,
    category: "Recovery",
    images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop"],
    stock: 30,
    expectedDelivery: "3-5 business days",
  },
  {
    name: "Creatine Monohydrate 500g",
    description: "Pure micronized creatine monohydrate powder. Increases strength, power, and muscle mass. 5g per serving, unflavored.",
    price: 1999,
    category: "Supplements",
    images: ["https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=400&fit=crop"],
    stock: 55,
    expectedDelivery: "2-4 business days",
  },
  {
    name: "Weightlifting Belt - Leather",
    description: "Premium 4-inch leather weightlifting belt with double prong buckle. Provides core support for heavy squats and deadlifts.",
    price: 3499,
    category: "Accessories",
    images: ["https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=400&fit=crop"],
    stock: 25,
    expectedDelivery: "5-7 business days",
  },
  {
    name: "Dry-Fit Gym T-Shirt",
    description: "Moisture-wicking performance t-shirt with 4-way stretch. Flatlock seams prevent chafing. Available in multiple colors.",
    price: 1499,
    category: "Apparel",
    images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop"],
    stock: 80,
    expectedDelivery: "3-5 business days",
  },
  {
    name: "Kettlebell 16kg",
    description: "Cast iron kettlebell with flat base and wide handle. Perfect for swings, goblet squats, and full-body conditioning workouts.",
    price: 3999,
    category: "Equipment",
    images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop"],
    stock: 15,
    expectedDelivery: "5-7 business days",
  },
  {
    name: "Massage Gun - Deep Tissue",
    description: "Percussion massage gun with 6 speed levels and 4 attachment heads. 2000mAh battery lasts up to 8 hours. Ultra-quiet motor.",
    price: 8999,
    category: "Recovery",
    images: ["https://images.unsplash.com/photo-1622112585837-c8ea7e15e609?w=400&h=400&fit=crop"],
    stock: 10,
    expectedDelivery: "7-10 business days",
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const deleted = await Product.deleteMany({});
    console.log(`Cleared ${deleted.deletedCount} existing products`);

    const inserted = await Product.insertMany(products);
    console.log(`Seeded ${inserted.length} products`);

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
