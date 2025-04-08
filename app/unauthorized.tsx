import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-16 text-center">
      <h2 className="text-3xl font-bold">
        You&apos;re not authenticated
      </h2>

      <p className="mb-4">
        You need to be authenticated to access this page or resource.
      </p>

      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Go back
      </Link>
    </div>
  )
}

export default Unauthorized;