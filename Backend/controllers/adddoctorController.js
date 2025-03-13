import Doctor from "../models/doctormodel.js";


const addDoctor = async (req, res) => {
    try {
        console.log("Received request to add doctor:", req.body);

        // Ensure the request body has all required fields
        if (!req.body.name || !req.body.specialization ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if doctor already exists by name (assuming names are unique)
        console.log("Checking if doctor already exists...");
        const existingDoctor = await Doctor.findOne({ name: req.body.name });
        console.log("Query result for existing doctor:", existingDoctor);

        if (existingDoctor) {
            return res.status(400).json({ message: "Doctor already exists" });
        }

        const { name, specialization } = req.body;



        // Create new doctor
        const newDoctor = new Doctor({ name, specialization,  patients: [] });
        await newDoctor.save();

        res.status(201).json({ message: "Doctor added successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error adding doctor", error });
    }
};

export default addDoctor;
