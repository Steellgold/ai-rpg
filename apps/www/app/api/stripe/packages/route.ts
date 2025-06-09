import { NextResponse } from "next/server";
import { auth } from "@/lib/supabase/auth";
import { CREDIT_PACKAGES } from "@/lib/config/credit-packages";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ packages: CREDIT_PACKAGES });
  } catch (error) {
    console.error("Error fetching credit packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit packages" },
      { status: 500 }
    );
  }
} 