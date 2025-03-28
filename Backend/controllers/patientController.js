import { Patient } from "../models/patientmodel.js";
import Bed from "../models/bedmodel.js";
import { BED_COSTS } from "../constants/bedCosts.js";

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
      admittedAt: new Date(),
      bedHistory: [
        {
          bedType: bedType,
          admittedAt: new Date(),
        },
      ],
    });

    await newPatient.save();

      // Assign the available bed to this patient
      availableBed.patient = newPatient._id;
      availableBed.status = "Occupied";

      availableBed.history.push({
        patient: newPatient._id,
        admittedAt: newPatient.admittedAt, // Ensure correct admission date
        bedType: bedType, // Store the type of bed used
      });
  
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

    const dischargeDate = new Date();

    patient.bedHistory.push({
      bedType: bed.type,
      admittedAt: patient.admittedAt,
      dischargedAt: dischargeDate,
    });

    let totalCost = 0;

    for (const history of bed.history) {
      if (String(history.patient) === String(patient._id)) {
        const startDate = new Date(history.admittedAt);
        const endDate = history.dischargedAt ? new Date(history.dischargedAt) : dischargeDate;
        const daysStayed = Math.max(1,Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))); // Convert ms to days
        totalCost += daysStayed * (BED_COSTS[bed.type] || 100); // Get cost per day
      }
    }

    patient.totalCost += totalCost;
    await patient.save();

    // Push the discharged patient into the history array
    bed.history.push({
      patient: patient._id,
      admittedAt: patient.admittedAt, // You should ideally store admission date
      dischargedAt: dischargeDate,
    });

    patient.bedHistory.push({
      bedType: bed.type,
      admittedAt: patient.admittedAt,
      dischargedAt: dischargeDate,
    });

    // Free the bed
    bed.patient = null;
    bed.status = "Vacant";
    await patient.save();
    await bed.save();

    res.json({ message: "Patient discharged, bed updated", patient, bed,totalCost });
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
      if (!patient.assignedBed) {
        return res.status(400).json({ error: "Patient has no assigned bed, cannot update severity." });
      }
      const currentBed = await Bed.findById(patient.assignedBed);
      if (!patient.bedHistory) {
        patient.bedHistory = [];
      }
      if (currentBed) {
        patient.bedHistory.push({
          bedType: currentBed.type,
          admittedAt: patient.admittedAt,
          dischargedAt: new Date(),  // Store discharge date before moving to new bed
        });

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
        patient.admittedAt = new Date();
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
        patient.admittedAt = new Date();
        await patient.save(); // ✅ Ensure patient update is saved

        bedMessage = "Patient moved from ICU to Regular Ward.";
      } 
      else {
        return res.status(400).json({ error: "No vacant General or Regular Ward beds available. Cannot change severity." });
      }
    }

    // If severity increases (Moderate/Low → Critical), move to ICU
    if (previousSeverity < 3 && severityNum === 3) {
      if (!patient.assignedBed) {
        return res.status(400).json({ error: "Patient has no assigned bed, cannot update severity." });
      }
      const currentBed = await Bed.findById(patient.assignedBed);
      if (!patient.bedHistory) {
        patient.bedHistory = [];
      }
      if (currentBed) {
        patient.bedHistory.push({
          bedType: currentBed.type,
          admittedAt: patient.admittedAt,
          dischargedAt: new Date(),  // Store discharge date before moving to new bed
        });
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
        patient.admittedAt = new Date();
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
