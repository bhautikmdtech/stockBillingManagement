import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Get the session to check if a user has authenticated via GitHub
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Check if the user already exists
    const existingUser = await User.findOne({ email: session.user.email });
    
    if (!existingUser) {
      // Create a new user record
      const newUser = new User({
        name: session.user.name || session.user.email.split('@')[0],
        email: session.user.email,
        profilePicture: session.user.image || '',
        registerType: 'github',
        role: 'user',
        accVerified: true, // Auto-verify OAuth users
        password: Math.random().toString(36).slice(-8) // Random password for OAuth users
      });
      
      await newUser.save();
    }
    
    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url));
  } catch (error) {
    console.error('Error during GitHub callback:', error);
    return NextResponse.redirect(new URL('/?error=github_callback', req.url));
  }
} 