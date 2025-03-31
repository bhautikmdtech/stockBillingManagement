import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if the superadmin user already exists
    const existingUser = await User.findOne({ email: "superadmin@demo.com" });
    
    if (existingUser) {
      return NextResponse.json({ 
        message: 'Superadmin user already exists',
        user: {
          id: existingUser._id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role
        }
      });
    }
    
    // Create the superadmin user
    const superAdmin = new User({
      name: "Super Admin",
      email: "superadmin@demo.com",
      password: "admin@123",
      role: "superadmin", // Special role for admin panel access
      registerType: "email",
      accVerified: true,
      activeSessions: []
    });
    
    await superAdmin.save();
    
    return NextResponse.json({
      success: true,
      message: 'Superadmin user created successfully',
      user: {
        id: superAdmin._id,
        email: superAdmin.email,
        name: superAdmin.name,
        role: superAdmin.role
      }
    });
    
  } catch (error) {
    console.error('Error creating seed data:', error);
    return NextResponse.json({ error: 'Failed to create seed data' }, { status: 500 });
  }
} 