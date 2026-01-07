import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <div className="flex mb-4 justify-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">404 - الصفحة غير موجودة</h1>
          <p className="text-gray-600 mb-6">
            عذراً، الصفحة التي تحاول الوصول إليها غير موجودة أو تم نقلها.
          </p>
          <Link href="/">
            <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-8 py-2 cursor-pointer">
              العودة للرئيسية
            </span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
