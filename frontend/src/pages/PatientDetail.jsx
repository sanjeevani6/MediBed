import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
    <div className="patient-detail-container">
      <h2>Patient Details</h2>
      <p><strong>Name:</strong> {patient.name}</p>
      <p><strong>Age:</strong> {patient.age}</p>
      <p><strong>Weight:</strong> {patient.weight}</p>
      <p><strong>PhoneNumber:</strong> {patient.phoneNumber}</p>
      <p><strong>Blood Group:</strong> {patient.bloodGroup}</p>
      <p><strong>Address:</strong> {patient.address}</p>
      <p><strong>Severity:</strong> {patient.severity}</p>
      <p><strong>Admission Date:</strong> {new Date(patient.admittedAt).toLocaleDateString()}</p>
      <p><strong>Status:</strong> {patient.status}</p>

      {/* Severity Trend Graph */}
      <h3>Severity Trend</h3>
{patient.severityHistory.length > 0 ? (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={patient.severityHistory}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="timestamp"
        tickFormatter={(time) => new Date(time).toLocaleDateString()}
      />
    <YAxis
  dataKey="severity"
  type="number"
  domain={[1, 3]}
  ticks={[1, 2, 3]}
  tickFormatter={(value) => {
    switch (value) {
      case 1:
        return "Low";
      case 2:
        return "Moderate";
      case 3:
        return "Critical";
      default:
        return value;
    }
  }}
  tick={{ fontSize: 14 }}  //  Makes text clearer
  width={70}             //  Gives enough space for full labels
/>

      <Tooltip
        formatter={(value, name) => {
          if (name === "severity") {
            return value === 1
              ? "Low"
              : value === 2
              ? "Moderate"
              : value === 3
              ? "Critical"
              : value;
          }
          return value;
        }}
        labelFormatter={(label) => new Date(label).toLocaleString()}
      />
      <Line type="monotone" dataKey="severity" stroke="#ff7300" />
    </LineChart>
  </ResponsiveContainer>
) : (
  <p>No severity history available.</p>
)}


 {/* Display Notes for Each Severity Change */}
 <div>
 <h3>Severity Notes</h3>
    <ul>
      {patient.severityHistory.map((entry, index) => (
        <li key={index}>
          <strong>{new Date(entry.timestamp).toLocaleDateString()}:</strong> {entry.note || "No note added"}
        </li>
      ))}
    </ul>
    </div>
      

      {/* Update Severity Form */}
      {patient.status === "ADMITTED" && (
  <div>
    <h3>Update Severity</h3>
    <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
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
    />
    <button onClick={handleSeverityUpdate}>Update Severity</button>
  </div>
)}


      {patient.status === "ADMITTED" && (
        <button onClick={handleDischarge} className="discharge-button">
          Discharge Patient
        </button>
      )}
    </div>
  );
};

export default PatientDetail;
