import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Stethoscope, Calendar, Users, FileText } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Stethoscope className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            نظام إدارة العيادة
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            نظام شامل ومتكامل لإدارة العيادات الطبية بكفاءة واحترافية
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="shadow-large hover:shadow-xl transition-all"
          >
            الدخول إلى النظام
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card p-6 rounded-xl shadow-medium hover:shadow-large transition-all">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">إدارة المرضى</h3>
            <p className="text-muted-foreground">
              تسجيل وإدارة بيانات المرضى بشكل آمن ومنظم مع سجل طبي متكامل
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-medium hover:shadow-large transition-all">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">جدولة المواعيد</h3>
            <p className="text-muted-foreground">
              نظام ذكي لحجز وإدارة المواعيد مع تنبيهات تلقائية
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-medium hover:shadow-large transition-all">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">السجلات الطبية</h3>
            <p className="text-muted-foreground">
              توثيق شامل للزيارات والتشخيصات والوصفات الطبية
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
