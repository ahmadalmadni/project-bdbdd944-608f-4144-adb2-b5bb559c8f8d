import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import SecretaryDashboard from "@/components/dashboards/SecretaryDashboard";
import DoctorDashboard from "@/components/dashboards/DoctorDashboard";

type UserRole = "secretary" | "doctor" | "admin" | null;

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        setUser(session.user);

        // Get user role
        const { data: roleData, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching user role:", error);
          toast.error("حدث خطأ في تحميل صلاحيات المستخدم");
          return;
        }

        if (!roleData) {
          toast.error("لم يتم تعيين دور لهذا المستخدم. يرجى التواصل مع المسؤول.");
          await supabase.auth.signOut();
          navigate("/auth");
          return;
        }

        setUserRole(roleData.role as UserRole);
      } catch (error) {
        console.error("Error in checkAuth:", error);
        toast.error("حدث خطأ في التحقق من الهوية");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !userRole) {
    return null;
  }

  if (userRole === "secretary" || userRole === "admin") {
    return <SecretaryDashboard user={user} />;
  }

  if (userRole === "doctor") {
    return <DoctorDashboard user={user} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">دور غير معروف</p>
    </div>
  );
};

export default Dashboard;
