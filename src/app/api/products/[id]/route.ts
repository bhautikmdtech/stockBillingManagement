import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";

// GET: Fetch a single product by ID
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    // Connect to the database
    await connectToDatabase();

    // Fetch the product by ID
    const product = await Product.findById(id).lean().exec();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT: Update a product
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    // Get the session to verify the user is authenticated
    const session = await auth();

    // Check if user is authenticated and has admin or superadmin role
    if (
      !session?.user ||
      (session.user.role !== "admin" && session.user.role !== "superadmin")
    ) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Parse the request body
    const data = await req.json();

    // Validate required fields
    if (
      !data.name ||
      !data.description ||
      data.price === undefined ||
      !data.sku
    ) {
      return NextResponse.json(
        { error: "Name, description, price, and SKU are required" },
        { status: 400 }
      );
    }

    // Check if the product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if the SKU exists (if it was changed)
    if (data.sku !== existingProduct.sku) {
      const skuExists = await Product.findOne({ sku: data.sku });
      if (skuExists) {
        return NextResponse.json(
          { error: "Product with this SKU already exists" },
          { status: 400 }
        );
      }
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category || "Other",
        image: data.image || "/images/default-product.png",
        stock: data.stock || 0,
        sku: data.sku,
      },
      { new: true } // Return the updated document
    );

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a product
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    // Get the session to verify the user is authenticated
    const session = await auth();

    // Check if user is authenticated and has admin or superadmin role
    if (
      !session?.user ||
      (session.user.role !== "admin" && session.user.role !== "superadmin")
    ) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Check if the product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete the product
    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
