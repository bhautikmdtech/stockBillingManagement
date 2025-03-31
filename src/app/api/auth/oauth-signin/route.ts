import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const { name, email, image, provider } = await req.json();
    
    // Check if required fields are provided
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    
    if (!existingUser) {
      // Create new user with OAuth data
      const newUser = new User({
        name: name || email.split('@')[0],
        email,
        profilePicture: image || '',
        registerType: provider || 'github',
        role: 'user',
        accVerified: true, // Auto-verify OAuth users
        password: Math.random().toString(36).slice(-8) // Random password for OAuth users
      });
      
      await newUser.save();
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error during OAuth sign-in:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
} 