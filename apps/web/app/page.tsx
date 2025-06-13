import { PageLayout } from "@workspace/ui/components/page-layout"
import { Button } from "@workspace/ui/components/button"

export default function Page() {
  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <Button size="sm">Button</Button>
      </div>
    </PageLayout>
  )
}
