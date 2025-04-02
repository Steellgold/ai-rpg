import { unauthorized } from "next/navigation";
import { PageClient } from "./page.client";
import { createClient } from "@/lib/supabase/server";

const Page = async() => {
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  return <PageClient />;
}

export default Page;