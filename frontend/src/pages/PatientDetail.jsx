import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import SidebarLayout from "../components/SidebarLayout";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [severity, setSeverity] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await axios.get(`/api/v1/patients/${id}`);
        setPatient(res.data);
      } catch (error) {
        console.error("Error fetching patient details:", error);
      }
    };
    fetchPatient();
  }, [id]);

  const handleDischarge = async () => {
    try {
      await axios.put(`/api/v1/patients/${id}/discharge`);
      alert("Patient discharged successfully!");
      navigate("/patients");
    } catch (error) {
      console.error("Error discharging patient:", error);
    }
  };

  const handleSeverityUpdate = async () => {
    try {
      const res = await axios.put(`/api/v1/patients/${id}/severity`, { severity:Number(severity), note });
      setPatient(res.data.patient);
      
      if (res.data.bedMessage) {
        alert(res.data.bedMessage);
      } else {
        alert("Severity updated successfully!");
      }
    } catch (error) {
      console.error("Error updating severity:", error);
    }
  };

  if (!patient) return <h2>Loading...</h2>;

  return (
    <SidebarLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">

        {/* Page Title */}
        <div className="text-2xl font-bold text-gray-500 mb-8 text-center py-2 px-10">
          PATIENT DETAILS
        </div>

        {/* Patient Info Card */}
        <div className="bg-white rounded-xl shadow p-6 space-y-2">
          <h3 className="text-4xl font-bold text-gray-700 mb-6 border-b pb-2">Basic Information</h3>
          <div className="grid sm:grid-cols-2 gap-y-2 gap-x-10 text-gray-700">
            <p><strong>Name:</strong> {patient.name}</p>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Weight:</strong> {patient.weight} kg</p>
            <p><strong>Phone:</strong> {patient.phoneNumber}</p>
            <p><strong>Blood Group:</strong> {patient.bloodGroup}</p>
            <p><strong>Address:</strong> {patient.address}</p>
            <p><strong>Severity:</strong> {patient.severity}</p>
            <p><strong>Admission Date:</strong> {new Date(patient.admittedAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> 
              <span className={`ml-2 font-semibold ${patient.status === 'ADMITTED' ? 'text-green-600' : 'text-red-600'}`}>
                {patient.status}
              </span>
            </p>
          </div>
        </div>

        {/* Severity Trend Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Severity Trend</h3>
          {patient.severityHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={patient.severityHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(time) => new Date(time).toLocaleDateString()}
                />
                <YAxis
                  domain={[1, 3]}
                  ticks={[1, 2, 3]}
                  tickFormatter={(val) =>
                    val === 1 ? "Low" : val === 2 ? "Moderate" : "Critical"
                  }
                />
                <Tooltip
                  formatter={(value) =>
                    value === 1 ? "Low" : value === 2 ? "Moderate" : "Critical"
                  }
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                />
                <Line type="monotone" dataKey="severity" stroke="#f97316" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No severity history available.</p>
          )}
        </div>

        {/* Severity Notes */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Severity Notes</h3>
          {patient.severityHistory.length > 0 ? (
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              {patient.severityHistory.map((entry, index) => (
                <li key={index}>
                  <strong>{new Date(entry.timestamp).toLocaleDateString()}:</strong> {entry.note || "No note added"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No notes added yet.</p>
          )}
        </div>

        {/* Update Severity */}
        {patient.status === "ADMITTED" && (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800">Update Severity</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="border px-4 py-2 rounded-md w-full md:w-1/4"
              >
                <option value="">Select Severity</option>
                <option value="1">Low</option>
                <option value="2">Moderate</option>
                <option value="3">Critical</option>
              </select>
              <input
                type="text"
                placeholder="Add a note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="border px-4 py-2 rounded-md flex-1"
              />
              <button
                onClick={handleSeverityUpdate}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Update Severity
              </button>
            </div>
          </div>
        )}

        {/* Discharge Button */}
        {patient.status === "ADMITTED" && (
          <div className="flex justify-end">
            <button
              onClick={handleDischarge}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Discharge Patient
            </button>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default PatientDetail;
