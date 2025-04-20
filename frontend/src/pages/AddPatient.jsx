import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@chakra-ui/react";

const AddPatient = ({ user }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    phoneNumber: "",
    bloodGroup: "A+",
    address: "",
    email:"",
    status: "ADMITTED",
    severity: "1",
    bedType: "Regular",
  });

  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [patientEmail, setPatientEmail] = useState("");
  const [patientDetails, setPatientDetails] = useState(null);

  // Ensure only logged-in users can access
  if (!user) {
    return <p className="error-message">YOU NEED TO BE LOGGED IN</p>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handlePatientEmailChange = (e) => {
    setPatientEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error before request
    try {
      console.log("formData",formData);
      const response = await axios.post("/api/v1/patients/add-patients", formData, { withCredentials: true });

      if (response.data?.message.includes("No vacant")) {
        setError(response.data.message);
        return;
      }

    //   // Show success pop-up
    //   // setShowPopup(true);
    //   // setTimeout(() => {
    //   //   setShowPopup(false);
    //   //   navigate("/dashboard"); // Redirect to dashboard
    //   // }, 3000);
    //   // Save the patient details to include in the email later
    //   setPatientDetails(response.data.patient || formData);
    //   // Show email form so the user can provide patient's email address
    //   setShowEmailForm(true);
    // } catch (error) {
    //   setError(error.response?.data?.message || "Failed to add patient.");
    // }

    const patient = response.data.patient || formData;

    // // Construct email message
    // const messageContent = `
    //   Patient Details:
    //   Name: ${patient.name}
    //   Age: ${patient.age}
    //   Weight: ${patient.weight}
    //   Phone: ${patient.phoneNumber}
    //   Blood Group: ${patient.bloodGroup}
    //   Address: ${patient.address}
    //   Status: ${patient.status}
    //   Severity: ${patient.severity}
    //   Bed Type: ${patient.bedType}
    // `;

    // // Send email
    // await axios.post(
    //   "http://localhost:8080/send-email",
    //   {
    //     email: patient.email, // ✅ send the email
    //     message: messageContent,
    //   },
    //   { withCredentials: true }
    // );

    // Optional: Redirect
    setTimeout(() => {
      navigate("/dashboard");
    }, 3000);
  } catch (error) {
    setError(error.response?.data?.message || "Failed to add patient or send email.");
  }

  };


  // const handleEmailSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   // Construct a message with patient details
  //   const messageContent = `
  //     Patient Details:
  //     Name: ${patientDetails.name}
  //     Age: ${patientDetails.age}
  //     Weight: ${patientDetails.weight}
  //     Phone: ${patientDetails.phoneNumber}
  //     Blood Group: ${patientDetails.bloodGroup}
  //     Address: ${patientDetails.address}
  //     Status: ${patientDetails.status}
  //     Severity: ${patientDetails.severity}
  //     Bed Type: ${patientDetails.bedType}
  //   `;
  //   try {
  //     // Send a request to your email endpoint
  //     await axios.post(
  //       "http://localhost:8080/send-email",
  //       { email: patientEmail, message: messageContent },
  //       { withCredentials: true }
  //     );
  //     // Optionally show a success message and redirect after a delay
  //     setTimeout(() => {
  //       navigate("/dashboard");
  //     }, 3000);
  //   } catch (error) {
  //     setError(error.response?.data?.message || "Failed to send email.");
  //   }
  // };

  return (
    <div className="add-patient-container">
      <h2>Add Patient</h2>
      {error && <p className="error">{error}</p>}
       {/* Patient Details Form */}
       {!showEmailForm && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Patient's Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="weight"
            placeholder="Weight (kg)"
            value={formData.weight}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />

          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            required
          >
            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
              (group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              )
            )}
          </select>
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="ADMITTED">Admitted</option>
            <option value="DISCHARGED">Discharged</option>
          </select>
          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            required
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
          >
            <option value="Regular">Regular</option>
            <option value="General">General</option>
            <option value="ICU">ICU</option>
            
          </select>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <button type="submit">Add Patient</button>
        </form>
      )}

      {/* Email Form */}

      {/* const handleSubmit = async () => {
  await axios.post("/api/v1/patients", {
    name,
    age,
    weight,
    phoneNumber,
    bloodGroup,
    address,
    severity,
    bedType,
    email, // ✅ send it
  });
}; */}

      {/* {showEmailForm && (
        <form onSubmit={handleEmailSubmit}>
          <h3>Patient added successfully!</h3>
          <p>Please enter the patient’s email address to send the details:</p>
          <input
            type="email"
            name="patientEmail"
            placeholder="Patient's Email"
            value={patientEmail}
            onChange={handlePatientEmailChange}
            required
          />
          <button type="submit">Send Email</button>
        </form>
      )} */}
    </div>
  );
};

export default AddPatient;

