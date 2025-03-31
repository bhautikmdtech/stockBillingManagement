import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User, { IUser } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Parse the request body
    const { email, password } = await req.json();

    // Check if all required fields are provided
    if (!email || !password) {
      return NextResponse.json(null, { status: 401 });
    }

    // Find the user by email and include the password field
    const user: any = (await User.findOne({ email }).select(
      "+password"
    )) as IUser | null;

    // If no user is found
    if (!user) {
      console.log("No user found with email:", email);
      return NextResponse.json(null, { status: 401 });
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.log("Invalid password for user:", email);
      return NextResponse.json(null, { status: 401 });
    }

    console.log("Authentication successful for:", email);

    // Check if user has reached the limit of active sessions
    if (user.activeSessions.length >= 10) {
      // Remove the oldest session
      user.activeSessions.shift();
      await user.save();
    }

    // Return user data in the format needed by NextAuth
    return NextResponse.json(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.profilePicture,
        role: user.role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during login-internal:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
