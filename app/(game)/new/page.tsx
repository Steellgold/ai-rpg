import { unauthorized } from "next/navigation";
import { PageClient } from "./page.client";
import { createClient } from "@/lib/supabase/server";

const Page = async() => {
  const supabase = await createClient();

  const { data: session } = await supabase.auth.getSession();
  if (!session) return unauthorized();

  return <PageClient />;
}

export default Page;