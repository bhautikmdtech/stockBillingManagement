import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const { name, email, password, city, state, phoneNumber, profilePicture } = await req.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }
    
    // Create a new user
    const newUser = new User({
      name,
      email,
      password,
      city: city || '',
      state: state || '',
      phoneNumber: phoneNumber || '',
      profilePicture: profilePicture || '',
      registerType: 'email', // Default to email registration
      role: 'user',
      accVerified: false,
      activeSessions: []
    });
    
    // Save the user to the database
    await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id,
        email: newUser.email,
        role: newUser.role
      }, 
      process.env.AUTH_SECRET as string,
      { expiresIn: '7d' }
    );
    
    // Add token to active sessions
    newUser.activeSessions.push(token);
    await newUser.save();
    
    // Return success response without exposing sensitive data
    return NextResponse.json({ 
      success: true, 
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
} 