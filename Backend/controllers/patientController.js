import { Patient } from "../models/patientmodel.js";
import Bed from "../models/bedmodel.js";

// to add patient
export const addPatient = async (req, res) => {
  try {
    const {
      name,
      age,
      weight,
      phoneNumber,
      bloodGroup,
      address,
      status,
      severity,
      bedType,
    } = req.body;
    console.log("request body",req.body);
     // Check for an available bed of the requested type
    const availableBed = await Bed.findOne({ type: bedType, status: "Vacant" });
    console.log("availableBed",availableBed);
    if (!availableBed) {
      return res.status(400).json({ message: `No vacant ${bedType} beds available.` });
    }

    // Validate required fields
    if (!name || !age || !weight || !phoneNumber || !bloodGroup || !address || !status || !severity || !bedType) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create a new patient
    const newPatient = new Patient({
      name,
      age,
      weight,
      phoneNumber,
      bloodGroup,
      address,
      status,
      severity,
      bedType,
      assignedBed: availableBed._id,
    });

    await newPatient.save();

      // Assign the available bed to this patient
      availableBed.patient = newPatient._id;
      availableBed.status = "Occupied";
  
      // Save bed allocation
      await availableBed.save();
    res.status(201).json({ message: "Patient added successfully and bed allocated!",
       patient: newPatient,
       allocatedBed: availableBed,
       });
  } catch (error) {
    console.error("Error adding patient:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
//to count number of patients
export const countPatients=async(req,res)=>{
  try {
    const count = await Patient.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patient count" });
  }
};
//to get patient
export const getPatients = async (req, res) => {
  try {
    const { status } = req.query;
    const patients = await Patient.find({ status });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

export const getpatientdetail=async(req,res)=>{
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
}

export const dischargepatient=async(req,res)=>{
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Update patient's status
    patient.status = "DISCHARGED";
    await patient.save();

    // Find the bed where the patient was admitted
    const bed = await Bed.findOne({ patient: patient._id });
    if (!bed) {
      return res.status(400).json({ error: "Bed not found for this patient" });
    }

    // Push the discharged patient into the history array
    bed.history.push({
      patient: patient._id,
      admittedAt: new Date(), // You should ideally store admission date
      dischargedAt: new Date(),
    });

    // Free the bed
    bed.patient = null;
    bed.status = "Vacant";

    await bed.save();

    res.json({ message: "Patient discharged, bed updated", patient, bed });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
}
export const updateSeverity = async (req, res) => {
  try {
    const { severity, note } = req.body;
    const patientId = req.params.id;

    const severityNum = Number(severity);
    if (![1, 2, 3].includes(severityNum)) {
      return res.status(400).json({ error: "Invalid severity value" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Push new severity record to history with timestamp
    patient.severityHistory.push({ 
      severity: severityNum, 
      note, 
      timestamp: new Date() // Store the timestamp
    });

    // Update current severity
    patient.severity = severityNum;

    await patient.save();
    res.json({ message: "Severity updated successfully", patient });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};


