import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-16 text-center">
      <h2 className="text-3xl font-bold">
        You&apos;re lost?
      </h2>
      <p className="mb-4">
        The page you are looking for does not exist.
      </p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Go back home
      </Link>
    </div>
  )
}

export default NotFound;