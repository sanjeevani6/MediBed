import Bed from "../models/bedmodel.js";

export const addBed = async (req, res) => {
  try {
    const { bedNumber, type } = req.body;
    const hospital = req.user.hospital;
    if (!bedNumber || !type) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Check if the bed already exists
    const existingBed = await Bed.findOne({ bedNumber });
    if (existingBed) {
      return res.status(400).json({ message: "Bed already exists!" });
    }

    const newBed = new Bed({
      bedNumber,
      type,
      hospital,
      status: "Vacant",
    });

    await newBed.save();
    res.status(201).json({ message: "Bed added successfully!", bed: newBed });
  } catch (error) {
    console.error("Error adding bed:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllBeds = async (req, res) => {
  try {
    const beds = await Bed.find({ hospital: req.user.hospital }).populate({
        path: "patient",
        model: "Patient", // Explicitly specify the model
        select: "name age severity"
      })
      
    console.log("all beds",beds);

    const vacantBeds = beds.filter((bed) => bed.status === "Vacant");
    const occupiedBeds = beds.filter((bed) => bed.status === "Occupied");

    res.json({ vacantBeds, occupiedBeds });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
export const countBeds = async (req, res) => {
  try {
    // Count beds where status is "Vacant"
    const count = await Bed.countDocuments({ status: "Vacant", hospital: req.user.hospital });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bed count" });
  }
};

export const getBedHistory = async (req, res) => {
  try {
    const hospitalId = req.user.hospital;

    const bed = await Bed.findOne({
      _id: req.params.id,
      hospital: hospitalId,
    })
      .populate("history.patient", "name age severity")
      .populate("patient", "name age severity");                                            ;
 console.log("bed:",bed);
    if (!bed) return res.status(404).json({ message: "Bed not found" });

    res.json(bed);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
