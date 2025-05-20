import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddPatient = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    phoneNumber: "",
    bloodGroup: "A+",
    address: "",
    status: "ADMITTED",
    severity: "1",
    bedType: "Regular",
  });

  const [error, setError] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [patientEmail, setPatientEmail] = useState("");
  const [patientDetails, setPatientDetails] = useState(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg font-semibold">YOU NEED TO BE LOGGED IN</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handlePatientEmailChange = (e) => {
    setPatientEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("/api/v1/patients/add-patients", formData, { withCredentials: true });

      if (response.data?.message.includes("No vacant")) {
        setError(response.data.message);
        return;
      }

      setPatientDetails(response.data.patient || formData);
      setShowEmailForm(true);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add patient.");
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const messageContent = `
      Patient Details:
      Name: ${patientDetails.name}
      Age: ${patientDetails.age}
      Weight: ${patientDetails.weight}
      Phone: ${patientDetails.phoneNumber}
      Blood Group: ${patientDetails.bloodGroup}
      Address: ${patientDetails.address}
      Status: ${patientDetails.status}
      Severity: ${patientDetails.severity}
      Bed Type: ${patientDetails.bedType}
    `;
    try {
      await axios.post(
        "http://localhost:8080/send-email",
        { email: patientEmail, message: messageContent },
        { withCredentials: true }
      );
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send email.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-lg font-bold">

        {!showEmailForm && (
          <>
          <div className="text-2xl font-bold text-gray-500 mb-8 text-center py-2 px-10">
          Add Patient
        </div>
            {error && (
              <p className="text-red-500 text-sm mb-4 text-center font-semibold">{error}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                name="name"
                placeholder="Patient's Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg"
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg"
              />
              <input
                type="number"
                name="weight"
                placeholder="Weight (kg)"
                value={formData.weight}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg"
              />
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg"
                style={{ border: '1px solid rgb(199, 200, 202)',
                    borderRadius: '0.375rem'
           }}
              />
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-lg"
                style={{ border: '1px solid rgb(199, 200, 202)',
                    borderRadius: '0.375rem'
           }}
              >
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg"
              />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-lg"
                style={{ border: '1px solid rgb(199, 200, 202)',
                    borderRadius: '0.375rem'
           }}
              >
                <option value="ADMITTED">Admitted</option>
                <option value="DISCHARGED">Discharged</option>
              </select>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-lg"
                style={{ border: '1px solid rgb(199, 200, 202)',
                    borderRadius: '0.375rem'
           }}
              >
                <option value="1">Low</option>
                <option value="2">Moderate</option>
                <option value="3">Critical</option>
              </select>
              <select
                name="bedType"
                value={formData.bedType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-lg"
                style={{ border: '1px solid rgb(199, 200, 202)',
                    borderRadius: '0.375rem'
           }}
              >
                <option value="Regular">Regular</option>
                <option value="General">General</option>
                <option value="ICU">ICU</option>
              </select>
              <button
                type="submit"
                className="button"
               
              >
                Add Patient
              </button>
            </form>
          </>
        )}

        {showEmailForm && (
          <>
            <h2 className="text-2xl font-bold text-gray-600 mb-6 text-center">
              Patient added successfully!
            </h2>
            <p className="mb-4 text-center">Please enter the patient’s email address to send the details:</p>
            {error && (
              <p className="text-red-500 text-sm mb-4 text-center font-semibold">{error}</p>
            )}
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <input
                type="email"
                name="patientEmail"
                placeholder="Patient's Email"
                value={patientEmail}
                onChange={handlePatientEmailChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg"
              />
            <button type="submit" className="button">
                Send Email
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AddPatient;
