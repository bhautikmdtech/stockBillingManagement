import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { appConstant } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const {
      search = "",
      page = appConstant.dataTable.page,
      limit = appConstant.dataTable.limit,
      sortBy = appConstant.dataTable.sortBy,
      sortOrder = appConstant.dataTable.sortOrder,
      filters = {}
    } = await req.json();
    
    // Build the query
    let query: any = {};
    
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add filters
    if (filters) {
      // Category filter
      if (filters.category) {
        query.category = filters.category;
      }
      
      // Price range filter
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        query.price = {};
        if (filters.minPrice !== undefined) {
          query.price.$gte = parseFloat(filters.minPrice);
        }
        if (filters.maxPrice !== undefined) {
          query.price.$lte = parseFloat(filters.maxPrice);
        }
      }
      
      // Stock filter
      if (filters.inStock === true) {
        query.stock = { $gt: 0 };
      } else if (filters.inStock === false) {
        query.stock = 0;
      }
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute the query
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Product.countDocuments(query);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;
    const hasPrev = page > 1;
    
    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
        hasPrev
      }
    });
    
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
} 