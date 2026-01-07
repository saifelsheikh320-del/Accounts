import { Layout } from "@/components/layout";

export default function Reports() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-[80vh] text-center p-8">
        <h1 className="text-4xl font-bold font-display mb-4 text-primary/40">Coming Soon</h1>
        <p className="text-muted-foreground max-w-md">
          Advanced reporting with date filtering, export capabilities, and detailed analytics is currently under development.
        </p>
      </div>
    </Layout>
  );
}
