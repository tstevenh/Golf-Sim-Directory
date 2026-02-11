import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { UserRole } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username, role } = body;

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Email, username, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const validRoles: UserRole[] = ["golfer", "business_owner"];
    const userRole = validRoles.includes(role) ? role : "golfer";

    // Create user via Supabase Auth Admin API
    // The trigger will auto-create the public.users row
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: username },
      app_metadata: { role: userRole },
    });

    if (error) {
      if (error.message.includes("already been registered")) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }
      throw error;
    }

    // The trigger may fire before app_metadata is set, so sync the role explicitly
    if (userRole !== "golfer") {
      await supabaseAdmin
        .from("users")
        .update({ role: userRole })
        .eq("id", data.user.id);
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: data.user.id,
          email: data.user.email,
          name: username,
          role: userRole,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
