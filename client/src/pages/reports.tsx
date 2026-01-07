import Layout from "@/components/layout";
import { FileBarChart } from "lucide-react";

export default function Reports() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="bg-primary/10 p-6 rounded-full text-primary mb-4">
          <FileBarChart className="w-16 h-16" />
        </div>
        <h1 className="text-3xl font-bold">التقارير التفصيلية</h1>
        <p className="text-muted-foreground max-w-md">
          جاري العمل على تطوير هذه الصفحة لإضافة تقارير مبيعات متقدمة وتحليلات الأرباح والخسائر.
        </p>
      </div>
    </Layout>
  );
}
