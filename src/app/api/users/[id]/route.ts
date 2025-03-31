import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/lib/auth";

// GET: Fetch a single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

    // Fetch the user by ID - exclude password
    const user = await User.findById(id).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT: Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
    const data = await request.json();

    // Remove sensitive fields that should not be updated through this endpoint
    const {
      password,
      email,
      registerType,
      accVerified,
      activeSessions,
      ...updateData
    } = data;

    // Check if the user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, select: "-password" } // Return the updated document without password
    );

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get the session to verify the user is authenticated
    const session = await auth();

    // Check if user is authenticated and has superadmin role
    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Don't allow deletion of the current user
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Check if the user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Don't allow deletion of superadmin accounts (except by the same superadmin)
    if (existingUser.role === "superadmin" && session.user.id !== id) {
      return NextResponse.json(
        { error: "Cannot delete a superadmin account" },
        { status: 403 }
      );
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
