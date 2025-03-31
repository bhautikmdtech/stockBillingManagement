import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/lib/auth";

// GET: Fetch all users
export async function GET(req: NextRequest) {
  try {
    // Get the session to verify the user is authenticated
    const session = await auth();
    
    // Check if user is authenticated and has superadmin role
    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Fetch all users
    const users = await User.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST: Create a new user
export async function POST(req: NextRequest) {
  try {
    // Get the session to verify the user is authenticated
    const session = await auth();
    
    // Check if user is authenticated and has superadmin role
    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const { name, email, password, role, city, state, phoneNumber } = await req.json();
    
    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }
    
    // Create a new user
    const newUser = new User({
      name,
      email,
      password,
      role: role || "user",
      city: city || "",
      state: state || "",
      phoneNumber: phoneNumber || "",
      registerType: "email",
      accVerified: true,
      activeSessions: []
    });
    
    await newUser.save();
    
    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
} 