import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";

interface Patient {
  id: string;
  full_name: string;
  national_id: string;
}

interface Prescription {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface VisitManagementProps {
  doctorId: string;
}

const VisitManagement = ({ doctorId }: VisitManagementProps) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    { medication_name: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);
  const [formData, setFormData] = useState({
    patient_id: "",
    chief_complaint: "",
    diagnosis: "",
    treatment_plan: "",
    follow_up_date: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, full_name, national_id")
        .order("full_name");

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const addPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      { medication_name: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ]);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const updatePrescription = (index: number, field: keyof Prescription, value: string) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create visit
      const { data: visitData, error: visitError } = await supabase
        .from("visits")
        .insert([
          {
            patient_id: formData.patient_id,
            doctor_id: doctorId,
            chief_complaint: formData.chief_complaint,
            diagnosis: formData.diagnosis,
            treatment_plan: formData.treatment_plan,
            follow_up_date: formData.follow_up_date || null,
            status: "مكتمل",
          },
        ])
        .select()
        .single();

      if (visitError) throw visitError;

      // Create prescriptions if any
      const validPrescriptions = prescriptions.filter((p) => p.medication_name && p.dosage);
      if (validPrescriptions.length > 0) {
        const prescriptionsData = validPrescriptions.map((p) => ({
          visit_id: visitData.id,
          ...p,
        }));

        const { error: prescError } = await supabase.from("prescriptions").insert(prescriptionsData);
        if (prescError) throw prescError;
      }

      toast.success("تم حفظ بيانات الزيارة بنجاح");
      
      // Reset form
      setFormData({
        patient_id: "",
        chief_complaint: "",
        diagnosis: "",
        treatment_plan: "",
        follow_up_date: "",
      });
      setPrescriptions([
        { medication_name: "", dosage: "", frequency: "", duration: "", instructions: "" },
      ]);
    } catch (error: any) {
      console.error("Error creating visit:", error);
      toast.error("حدث خطأ أثناء حفظ بيانات الزيارة");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.national_id.includes(searchTerm)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>معلومات الزيارة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">البحث عن مريض</Label>
            <Input
              id="search"
              placeholder="ابحث بالاسم أو الرقم الوطني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="patient_id">المريض *</Label>
            <Select
              value={formData.patient_id}
              onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
              disabled={loading}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المريض" />
              </SelectTrigger>
              <SelectContent>
                {filteredPatients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.full_name} - {patient.national_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chief_complaint">الشكوى الرئيسية *</Label>
            <Textarea
              id="chief_complaint"
              value={formData.chief_complaint}
              onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
              required
              disabled={loading}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">التشخيص</Label>
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment_plan">خطة العلاج</Label>
            <Textarea
              id="treatment_plan"
              value={formData.treatment_plan}
              onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="follow_up_date">موعد المتابعة</Label>
            <Input
              id="follow_up_date"
              type="date"
              value={formData.follow_up_date}
              onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>الوصفة الطبية</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addPrescription} disabled={loading}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة دواء
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {prescriptions.map((prescription, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3 relative">
              {prescriptions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 left-2"
                  onClick={() => removePrescription(index)}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>اسم الدواء</Label>
                  <Input
                    value={prescription.medication_name}
                    onChange={(e) => updatePrescription(index, "medication_name", e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>الجرعة</Label>
                  <Input
                    value={prescription.dosage}
                    onChange={(e) => updatePrescription(index, "dosage", e.target.value)}
                    disabled={loading}
                    placeholder="مثال: 500 ملجم"
                  />
                </div>

                <div className="space-y-2">
                  <Label>عدد المرات</Label>
                  <Input
                    value={prescription.frequency}
                    onChange={(e) => updatePrescription(index, "frequency", e.target.value)}
                    disabled={loading}
                    placeholder="مثال: 3 مرات يومياً"
                  />
                </div>

                <div className="space-y-2">
                  <Label>المدة</Label>
                  <Input
                    value={prescription.duration}
                    onChange={(e) => updatePrescription(index, "duration", e.target.value)}
                    disabled={loading}
                    placeholder="مثال: أسبوع"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>تعليمات</Label>
                <Textarea
                  value={prescription.instructions}
                  onChange={(e) => updatePrescription(index, "instructions", e.target.value)}
                  disabled={loading}
                  rows={2}
                  placeholder="مثال: بعد الأكل"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        حفظ الزيارة
      </Button>
    </form>
  );
};

export default VisitManagement;
