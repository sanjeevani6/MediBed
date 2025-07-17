import { Patient } from "../models/patientmodel.js";
import Bed from "../models/bedmodel.js";
import { BED_COSTS } from "../constants/bedCosts.js";
import { sendEmail } from "../utils/sendEmail.js";  // Update the path as necessary


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
      email,
    } = req.body;
    console.log("request body",req.body);
     // Check for an available bed of the requested type
    const availableBed = await Bed.findOne({ type: bedType, status: "Vacant" , hospital: req.user.hospital,});
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
      email,
      assignedBed: availableBed._id,
      admittedAt: new Date(),
      severityHistory: [
        {
          severity: severity, // Store the initial severity
          note: "Initial severity on admission",
          timestamp: new Date(),
        },
      ],
      hospital: req.user.hospital,
    });

    newPatient.bedHistory.push({
      bedType: bedType,
      admittedAt: newPatient.admittedAt,
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

      const messageContent = `
      Dear ${newPatient.name},
      Name: ${newPatient.name}
      Age: ${newPatient.age}
      Weight: ${newPatient.weight}
      Phone: ${newPatient.phoneNumber}
      Blood Group: ${newPatient.bloodGroup}
      Address: ${newPatient.address}
      Bed Type: ${newPatient.bedType}
      Severity: ${newPatient.severity}
      Status: ${newPatient.status}
      Admission Date: ${new Date(newPatient.admittedAt).toLocaleDateString()}

      Regards,
      MediBed Hospital
    `;

    await sendEmail(newPatient.email, messageContent);


    res.status(201).json({ message: "Patient added successfully and bed allocated, email sent!",
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
    const count = await Patient.countDocuments({
     hospital: req.user.hospital,
      status: "ADMITTED" // Only count patients who are currently admitted
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patient count" });
  }
};
//to get patient
export const getPatients = async (req, res) => {
  try {
    const { status } = req.query;
    const patients = await Patient.find({ status, hospital: req.user.hospital });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

export const getpatientdetail=async(req,res)=>{
  try {
    const patient = await Patient.findById({ _id: req.params.id, hospital: req.user.hospital });
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
}

export const dischargepatient=async(req,res)=>{
  try {
    const patient = await Patient.findOne({ _id: req.params.id, hospital: req.user.hospital });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Update patient's status
    patient.status = "DISCHARGED";
    // await patient.save();
    const dischargeDate = new Date();

    // Free the bed and update its history
if (patient.assignedBed) {
  const bed = await Bed.findOne({ _id: patient.assignedBed, hospital: req.user.hospital });

  if (bed) {
    const bedHistEntry = bed.history.find(
      (entry) => entry.patient.toString() === patient._id.toString() && !entry.dischargedAt
    );
    if (bedHistEntry) {
      bedHistEntry.dischargedAt = new Date();
    }
    bed.status = "Vacant";
    bed.patient = null;
    await bed.save();
  }
}



    // Update the last bed history entry's dischargedAt instead of pushing a new one
    const lastBedEntry = patient.bedHistory[patient.bedHistory.length - 1];
    if (lastBedEntry && !lastBedEntry.dischargedAt) {
      lastBedEntry.dischargedAt = dischargeDate;
    }

    let totalCost = 0;
    if (!patient.bedHistory) patient.bedHistory = [];

    for (const history of patient.bedHistory) {
      if (history.dischargedAt) {
        const startDate = new Date(history.admittedAt);
        const endDate = new Date(history.dischargedAt);
        const daysStayed = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))); // Convert ms to days
        totalCost += daysStayed * (BED_COSTS[history.bedType] || 100);
      }
    }

    patient.totalCost += totalCost;
    await patient.save();

    let bed;
    if (patient.assignedBed) {
      bed = await Bed.findById(patient.assignedBed);
      if (bed) {
        // close bed.history
        const bEntry = bed.history.find(
          (e) => e.patient.toString() === patient._id.toString() && !e.dischargedAt
        );
        if (bEntry) bEntry.dischargedAt = dischargeDate;
        bed.status = "Vacant";
        bed.patient = null;
        await bed.save();
      }
    }

    await patient.save();
    const emailContent = `
    Dear ${patient.name},

    Patient Details:
    - Name: ${patient.name}
    - Age: ${patient.age}
    - Blood Group: ${patient.bloodGroup}
    - Address: ${patient.address}
    - Bed Type: ${bed.type}
    - Admission Date: ${new Date(patient.admittedAt).toLocaleDateString()}
    - Discharge Date: ${dischargeDate.toLocaleDateString()}

    Bed History:
    ${patient.bedHistory.map((history, index) => `
      ${index + 1}. Bed Type: ${history.bedType}, Admitted: ${new Date(history.admittedAt).toLocaleDateString()}, Discharged: ${history.dischargedAt ? new Date(history.dischargedAt).toLocaleDateString() : "N/A"}
    `).join("\n")}

    Total Stay Cost: Rs: ${totalCost}


    Regards,
    MediBed Hospital
  `;

  // Send email with the discharge details
  await sendEmail(patient.email, emailContent);

    res.json({ message: "Patient discharged, bed updated, email sent!", patient, bed,totalCost });
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
        // patient.bedHistory.push({
        //   bedType: currentBed.type,
        //   admittedAt: patient.admittedAt,
        //   dischargedAt: new Date(),  // Store discharge date before moving to new bed
        // });

        const last = patient.bedHistory[patient.bedHistory.length - 1];
        if (last && !last.dischargedAt) last.dischargedAt = new Date();

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
        const last = patient.bedHistory[patient.bedHistory.length - 1];
        if (last && !last.dischargedAt) last.dischargedAt = new Date();

        patient.bedHistory.push({
          bedType: generalBed.type,
          admittedAt: patient.admittedAt
        });
        // await patient.save(); // ✅ Ensure patient update is saved

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
        patient.bedHistory.push({
          bedType: regularBed.type,
          admittedAt: patient.admittedAt
        });
        // await patient.save(); // ✅ Ensure patient update is saved

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
        const last = patient.bedHistory[patient.bedHistory.length - 1];
        if (last && !last.dischargedAt) last.dischargedAt = new Date();
        // patient.bedHistory.push({
        //   bedType: currentBed.type,
        //   admittedAt: patient.admittedAt,
        //   dischargedAt: new Date(),  // Store discharge date before moving to new bed
        // });
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
        patient.bedHistory.push({
          bedType: icuBed.type,
          admittedAt: patient.admittedAt
        });
        // await patient.save(); // ✅ Ensure patient update is saved

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
    res.status(500).json({ error: "Server Error" });
  }
};
