import { env } from "@/lib/env/env";
import { NextResponse } from "next/server";

export const GET = (): NextResponse => {
  return NextResponse.redirect(env.NEXT_PUBLIC_BASE_URL + "/continue");
}