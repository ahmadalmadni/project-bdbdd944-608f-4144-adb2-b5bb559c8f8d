import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Patient {
  id: string;
  national_id: string;
  full_name: string;
  phone: string;
  gender: string;
  blood_type: string;
}

const PatientsList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, national_id, full_name, phone, gender, blood_type")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPatients(data || []);
    } catch (error: any) {
      console.error("Error fetching patients:", error);
      toast.error("حدث خطأ في تحميل قائمة المرضى");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.national_id.includes(searchTerm) ||
      (patient.phone && patient.phone.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="البحث بالاسم، الرقم الوطني، أو رقم الهاتف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      {filteredPatients.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">لا توجد نتائج</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الرقم الوطني</TableHead>
                <TableHead>رقم الهاتف</TableHead>
                <TableHead>الجنس</TableHead>
                <TableHead>فصيلة الدم</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.full_name}</TableCell>
                  <TableCell>{patient.national_id}</TableCell>
                  <TableCell>{patient.phone || "-"}</TableCell>
                  <TableCell>
                    {patient.gender && (
                      <Badge variant={patient.gender === "ذكر" ? "default" : "secondary"}>
                        {patient.gender}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{patient.blood_type || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PatientsList;
