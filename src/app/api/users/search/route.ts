import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { appConstant } from "@/lib/constants";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Get the session to verify the user is authenticated
    const session = await auth();
    
    // Check if user is authenticated and has admin or superadmin role
    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }
    
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
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add filters
    if (filters) {
      // Role filter
      if (filters.role) {
        query.role = filters.role;
      }
      
      // Registration type filter
      if (filters.registerType) {
        query.registerType = filters.registerType;
      }
      
      // Location filter
      if (filters.city) {
        query.city = { $regex: filters.city, $options: 'i' };
      }
      
      if (filters.state) {
        query.state = { $regex: filters.state, $options: 'i' };
      }
      
      // Account verification filter
      if (filters.accVerified !== undefined) {
        query.accVerified = filters.accVerified;
      }
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute the query - exclude password
    const users = await User.find(query, { password: 0 })
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await User.countDocuments(query);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;
    const hasPrev = page > 1;
    
    return NextResponse.json({
      users,
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
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
} 