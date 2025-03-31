import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if products already exist
    const productsCount = await Product.countDocuments();
    
    if (productsCount > 0) {
      return NextResponse.json({ 
        message: 'Sample products already exist',
        count: productsCount
      });
    }
    
    // Sample products to add
    const sampleProducts = [
      {
        name: "Smartphone X1",
        description: "Latest smartphone with high-resolution camera and fast processor",
        price: 799.99,
        category: "Electronics",
        image: "/images/default-product.png",
        stock: 25,
        sku: "ELEC001"
      },
      {
        name: "Classic T-Shirt",
        description: "Comfortable cotton t-shirt available in multiple colors",
        price: 24.99,
        category: "Clothing",
        image: "/images/default-product.png",
        stock: 100,
        sku: "CLTH001"
      },
      {
        name: "Office Desk",
        description: "Modern office desk with ample storage space",
        price: 349.99,
        category: "Furniture",
        image: "/images/default-product.png",
        stock: 10,
        sku: "FURN001"
      },
      {
        name: "Building Blocks Set",
        description: "Educational building blocks for children aged 3+",
        price: 29.99,
        category: "Toys",
        image: "/images/default-product.png",
        stock: 50,
        sku: "TOY001"
      },
      {
        name: "Silver Pendant",
        description: "Elegant silver pendant with cubic zirconia",
        price: 99.99,
        category: "Jewelry",
        image: "/images/default-product.png",
        stock: 15,
        sku: "JWL001"
      }
    ];
    
    // Insert sample products
    await Product.insertMany(sampleProducts);
    
    return NextResponse.json({
      success: true,
      message: 'Sample products created successfully',
      count: sampleProducts.length
    });
    
  } catch (error) {
    console.error('Error creating seed data:', error);
    return NextResponse.json({ error: 'Failed to create seed data' }, { status: 500 });
  }
} 