import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Users, ClipboardList, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import PatientRecords from "@/components/doctor/PatientRecords";
import VisitManagement from "@/components/doctor/VisitManagement";

interface DoctorDashboardProps {
  user: User;
}

const DoctorDashboard = ({ user }: DoctorDashboardProps) => {
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
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">لوحة الطبيب</h1>
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
          <TabsList className="grid w-full grid-cols-2 lg:w-auto">
            <TabsTrigger value="patients" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">سجلات المرضى</span>
            </TabsTrigger>
            <TabsTrigger value="visits" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">الزيارات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>سجلات المرضى</CardTitle>
                <CardDescription>عرض وإدارة سجلات المرضى الطبية</CardDescription>
              </CardHeader>
              <CardContent>
                <PatientRecords doctorId={user.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visits">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الزيارات</CardTitle>
                <CardDescription>إضافة التشخيص والوصفات الطبية</CardDescription>
              </CardHeader>
              <CardContent>
                <VisitManagement doctorId={user.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DoctorDashboard;
