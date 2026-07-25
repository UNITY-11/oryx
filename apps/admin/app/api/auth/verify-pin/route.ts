import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    
    // We use an environment variable for the PIN. If not set, default to '1234'
    const correctPin = process.env.ADMIN_PIN || "1234";
    
    if (pin === correctPin) {
      // Set a secure, HTTP-only cookie valid for 24 hours
      const cookieStore = await cookies();
      cookieStore.set("admin_pin_auth", "true", { 
        path: "/", 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 
      });
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, error: "Incorrect PIN" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
