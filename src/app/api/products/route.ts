import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";

// GET: Fetch all products
export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Fetch all products
    const products = await Product.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST: Create a new product
export async function POST(req: NextRequest) {
  try {
    // Get the session to verify the user is authenticated
    const session = await auth();
    
    // Check if user is authenticated and has admin or superadmin role
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const { name, description, price, category, image, stock, sku } = await req.json();
    
    // Validate required fields
    if (!name || !description || price === undefined || !sku) {
      return NextResponse.json(
        { error: "Name, description, price, and SKU are required" },
        { status: 400 }
      );
    }
    
    // Check if product with this SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this SKU already exists" },
        { status: 400 }
      );
    }
    
    // Create a new product
    const newProduct = new Product({
      name,
      description,
      price,
      category: category || "Other",
      image: image || "/images/default-product.png",
      stock: stock || 0,
      sku
    });
    
    await newProduct.save();
    
    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product: {
        id: newProduct._id,
        name: newProduct.name,
        price: newProduct.price,
        sku: newProduct.sku
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
} 