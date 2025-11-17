import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Calendar, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Patient {
  id: string;
  national_id: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  address: string;
  blood_type: string;
  allergies: string;
  chronic_diseases: string;
  visits: Array<{
    id: string;
    visit_date: string;
    chief_complaint: string;
    diagnosis: string;
    status: string;
  }>;
}

interface PatientRecordsProps {
  doctorId: string;
}

const PatientRecords = ({ doctorId }: PatientRecordsProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPatients();
  }, [doctorId]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select(`
          *,
          visits (
            id,
            visit_date,
            chief_complaint,
            diagnosis,
            status
          )
        `)
        .order("full_name");

      if (error) throw error;

      setPatients(data || []);
    } catch (error: any) {
      console.error("Error fetching patients:", error);
      toast.error("حدث خطأ في تحميل سجلات المرضى");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.national_id.includes(searchTerm)
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
          placeholder="البحث بالاسم أو الرقم الوطني..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      {filteredPatients.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">لا توجد نتائج</p>
      ) : (
        <div className="grid gap-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{patient.full_name}</CardTitle>
                    <CardDescription>الرقم الوطني: {patient.national_id}</CardDescription>
                  </div>
                  <Badge variant={patient.gender === "ذكر" ? "default" : "secondary"}>
                    {patient.gender}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {patient.date_of_birth && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>تاريخ الميلاد: {new Date(patient.date_of_birth).toLocaleDateString("ar-SA")}</span>
                    </div>
                  )}
                  {patient.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{patient.phone}</span>
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-center gap-2 md:col-span-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{patient.address}</span>
                    </div>
                  )}
                </div>

                {patient.blood_type && (
                  <div>
                    <span className="font-semibold">فصيلة الدم: </span>
                    <Badge variant="outline">{patient.blood_type}</Badge>
                  </div>
                )}

                {patient.allergies && (
                  <div>
                    <span className="font-semibold text-destructive">حساسية: </span>
                    <span className="text-sm">{patient.allergies}</span>
                  </div>
                )}

                {patient.chronic_diseases && (
                  <div>
                    <span className="font-semibold">أمراض مزمنة: </span>
                    <span className="text-sm">{patient.chronic_diseases}</span>
                  </div>
                )}

                {patient.visits && patient.visits.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">آخر الزيارات:</h4>
                    <div className="space-y-2">
                      {patient.visits.slice(0, 3).map((visit) => (
                        <div key={visit.id} className="text-sm p-2 bg-muted rounded">
                          <div className="flex justify-between items-start">
                            <span className="font-medium">{visit.chief_complaint}</span>
                            <Badge variant="outline" className="text-xs">
                              {new Date(visit.visit_date).toLocaleDateString("ar-SA")}
                            </Badge>
                          </div>
                          {visit.diagnosis && (
                            <p className="text-muted-foreground mt-1">التشخيص: {visit.diagnosis}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientRecords;
