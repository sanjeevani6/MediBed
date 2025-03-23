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

    const previousSeverity = patient.severity;
    let bedMessage = "";

    // If severity decreases (Critical → Moderate/Low), move from ICU to General
    if (previousSeverity === 3 && severityNum < 3) {
      const currentBed = await Bed.findById(patient.assignedBed);
      if (currentBed) {
        // Free ICU bed
        currentBed.status = "Vacant";
        currentBed.patient = null;
        await currentBed.save();
      }

      // Find a General Ward Bed
      const generalBed = await Bed.findOne({ type: "General", status: "Vacant" });
      const regularBed = await Bed.findOne({ type: "Regular", status: "Vacant" });

      if (generalBed) {
        generalBed.status = "Occupied";
        generalBed.patient = patient._id;
        await generalBed.save();

        // **Update patient's assigned bed**
        patient.assignedBed = generalBed._id;
        patient.bedType=generalBed.type;
        await patient.save(); // ✅ Ensure patient update is saved

        bedMessage = "Patient moved from ICU to General Ward.";
      } 
      else if (regularBed) {
        regularBed.status = "Occupied";
        regularBed.patient = patient._id;
        await regularBed.save();

        // **Update patient's assigned bed**
        patient.assignedBed = regularBed._id;
        patient.bedType=regularBed.type;
        await patient.save(); // ✅ Ensure patient update is saved

        bedMessage = "Patient moved from ICU to Regular Ward.";
      } 
      else {
        return res.status(400).json({ error: "No vacant General or Regular Ward beds available. Cannot change severity." });
      }
    }

    // If severity increases (Moderate/Low → Critical), move to ICU
    if (previousSeverity < 3 && severityNum === 3) {
      const currentBed = await Bed.findById(patient.assignedBed);
      if (currentBed) {
        // Free General Bed
        currentBed.status = "Vacant";
        currentBed.patient = null;
        await currentBed.save();
      }

      // Find an ICU Bed
      const icuBed = await Bed.findOne({ type: "ICU", status: "Vacant" });
      console.log(icuBed)
      if (icuBed) {
        icuBed.status = "Occupied";
        icuBed.patient = patient._id;
        await icuBed.save();

        // **Update patient's assigned bed**
        patient.assignedBed = icuBed._id;
        patient.bedType=icuBed.type;
        await patient.save(); // ✅ Ensure patient update is saved

        bedMessage = "Patient moved to ICU due to severity increase.";
      } else {
        return res.status(400).json({ error: "No vacant ICU beds available. Cannot change severity." });
      }
    }

    // Update severity and history
    patient.severity = severityNum;
    patient.severityHistory.push({ severity: severityNum, note, timestamp: new Date() });
    
    await patient.save(); // ✅ Ensure all updates are saved

    res.json({ message: "Severity updated successfully.", patient, bedMessage });

  } catch (error) {
    console.error("Error updating severity:", error);
    res.status(500).json({ error: "Server Error" });
  }
};
