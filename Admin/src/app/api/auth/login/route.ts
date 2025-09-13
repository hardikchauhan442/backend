import { NextRequest, NextResponse } from "next/server";
import { appConfig } from "@/config/app.config";

// Mock user database
const mockUsers = [
  {
    id: "1",
    email: "admin@example.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
  },
  {
    id: "2",
    email: "editor@example.com",
    password: "editor123",
    name: "Editor User",
    role: "editor",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=editor",
  },
  {
    id: "3",
    email: "viewer@example.com",
    password: "viewer123",
    name: "Viewer User",
    role: "viewer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=viewer",
  },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate mock JWT token (in real app, use proper JWT library)
    const token = Buffer.from(
      JSON.stringify({
        userId: user.id,
        email: user.email,
        role: user.role,
        exp: Date.now() + appConfig.auth.sessionTimeout,
      })
    ).toString("base64");

    // Create user response (exclude password)
    const { password: _, ...userResponse } = user;

    // Set HTTP-only cookie for token
    const response = NextResponse.json({
      success: true,
      token,
      user: userResponse,
    });

    response.cookies.set(appConfig.auth.tokenKey, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: appConfig.auth.sessionTimeout / 1000,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
