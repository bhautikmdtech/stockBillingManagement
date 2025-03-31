import mongoose from 'mongoose';

export interface IProduct extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  sku: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Product name is required'],
      trim: true
    },
    description: { 
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    price: { 
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative']
    },
    category: { 
      type: String,
      required: [true, 'Product category is required'],
      enum: ['Electronics', 'Clothing', 'Furniture', 'Toys', 'Jewelry', 'Other'],
      default: 'Other'
    },
    image: { 
      type: String,
      default: '/images/default-product.png'
    },
    stock: { 
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    sku: { 
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true
    }
  },
  { 
    timestamps: true 
  }
);

// Create model only if it doesn't exist already
// Wrap in try-catch to avoid errors in Edge runtime
let Product: mongoose.Model<IProduct>;

try {
  // Check if the mongoose models object exists
  Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
} catch (error) {
  // This will run in Edge runtime where mongoose.models may not exist
  Product = mongoose.model<IProduct>('Product', ProductSchema);
}

export default Product; 