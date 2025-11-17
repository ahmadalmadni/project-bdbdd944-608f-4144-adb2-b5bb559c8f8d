import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Patient {
  id: string;
  full_name: string;
  national_id: string;
}

interface Doctor {
  id: string;
  full_name: string;
}

const AppointmentScheduling = () => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    notes: "",
  });

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
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

  const fetchDoctors = async () => {
    try {
      // First get doctor user_ids
      const { data: doctorRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "doctor");

      if (rolesError) throw rolesError;

      const doctorIds = doctorRoles?.map(r => r.user_id) || [];

      if (doctorIds.length === 0) {
        setDoctors([]);
        return;
      }

      // Then get profiles for those doctors
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", doctorIds);

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const appointmentDateTime = `${formData.appointment_date}T${formData.appointment_time}:00`;

      const { error } = await supabase.from("appointments").insert([
        {
          patient_id: formData.patient_id,
          doctor_id: formData.doctor_id,
          appointment_date: appointmentDateTime,
          notes: formData.notes,
          created_by: user.id,
        },
      ]);

      if (error) throw error;

      toast.success("تم حجز الموعد بنجاح");
      setFormData({
        patient_id: "",
        doctor_id: "",
        appointment_date: "",
        appointment_time: "",
        notes: "",
      });
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      toast.error("حدث خطأ أثناء حجز الموعد");
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
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label htmlFor="doctor_id">الطبيب *</Label>
        <Select
          value={formData.doctor_id}
          onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
          disabled={loading}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر الطبيب" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                {doctor.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="appointment_date">التاريخ *</Label>
          <Input
            id="appointment_date"
            type="date"
            value={formData.appointment_date}
            onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="appointment_time">الوقت *</Label>
          <Input
            id="appointment_time"
            type="time"
            value={formData.appointment_time}
            onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">ملاحظات</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          disabled={loading}
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        حجز الموعد
      </Button>
    </form>
  );
};

export default AppointmentScheduling;
