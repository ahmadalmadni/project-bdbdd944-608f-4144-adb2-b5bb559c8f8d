import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const PatientRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    national_id: "",
    full_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    address: "",
    blood_type: "",
    allergies: "",
    chronic_diseases: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if patient already exists
      const { data: existingPatient } = await supabase
        .from("patients")
        .select("id")
        .eq("national_id", formData.national_id)
        .maybeSingle();

      if (existingPatient) {
        toast.error("هذا الرقم الوطني مسجل بالفعل في النظام");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("patients").insert([
        {
          ...formData,
          date_of_birth: formData.date_of_birth || null,
        },
      ]);

      if (error) {
        throw error;
      }

      toast.success("تم تسجيل المريض بنجاح");
      setFormData({
        national_id: "",
        full_name: "",
        date_of_birth: "",
        gender: "",
        phone: "",
        address: "",
        blood_type: "",
        allergies: "",
        chronic_diseases: "",
      });
    } catch (error: any) {
      console.error("Error registering patient:", error);
      toast.error("حدث خطأ أثناء تسجيل المريض");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="national_id">الرقم الوطني *</Label>
          <Input
            id="national_id"
            value={formData.national_id}
            onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
            required
            disabled={loading}
            placeholder="1XXXXXXXXX"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name">الاسم الكامل *</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_of_birth">تاريخ الميلاد</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">الجنس</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData({ ...formData, gender: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الجنس" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ذكر">ذكر</SelectItem>
              <SelectItem value="أنثى">أنثى</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={loading}
            placeholder="05XXXXXXXX"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="blood_type">فصيلة الدم</Label>
          <Select
            value={formData.blood_type}
            onValueChange={(value) => setFormData({ ...formData, blood_type: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر فصيلة الدم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="O-">O-</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">العنوان</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          disabled={loading}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="allergies">الحساسية</Label>
        <Textarea
          id="allergies"
          value={formData.allergies}
          onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
          disabled={loading}
          rows={2}
          placeholder="أدخل أي حساسية للأدوية أو الأطعمة"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="chronic_diseases">الأمراض المزمنة</Label>
        <Textarea
          id="chronic_diseases"
          value={formData.chronic_diseases}
          onChange={(e) => setFormData({ ...formData, chronic_diseases: e.target.value })}
          disabled={loading}
          rows={2}
          placeholder="أدخل أي أمراض مزمنة"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        تسجيل المريض
      </Button>
    </form>
  );
};

export default PatientRegistration;
