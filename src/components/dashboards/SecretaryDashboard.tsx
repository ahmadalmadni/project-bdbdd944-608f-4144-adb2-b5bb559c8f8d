import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, UserPlus, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import PatientRegistration from "@/components/secretary/PatientRegistration";
import AppointmentScheduling from "@/components/secretary/AppointmentScheduling";
import PatientsList from "@/components/secretary/PatientsList";

interface SecretaryDashboardProps {
  user: User;
}

const SecretaryDashboard = ({ user }: SecretaryDashboardProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("patients");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">لوحة السكرتارية</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="patients" className="gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">المرضى</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">المواعيد</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">التقارير</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تسجيل مريض جديد</CardTitle>
                <CardDescription>أدخل بيانات المريض الجديد</CardDescription>
              </CardHeader>
              <CardContent>
                <PatientRegistration />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>قائمة المرضى</CardTitle>
                <CardDescription>جميع المرضى المسجلين في النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <PatientsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>جدولة المواعيد</CardTitle>
                <CardDescription>إضافة وإدارة مواعيد المرضى</CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentScheduling />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>التقارير والفواتير</CardTitle>
                <CardDescription>طباعة الفواتير والتقارير</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">سيتم إضافة نظام التقارير قريباً</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SecretaryDashboard;
