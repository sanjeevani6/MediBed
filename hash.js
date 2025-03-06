import bcrypt from "bcrypt";

const generateHash = async (password) => {
  const saltRounds = 10; // Defines the security level
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log(`Hashed Password: ${hashedPassword}`);
};

// Replace "your_password" with the actual password you want to hash
generateHash("1234");

const comparePassword = async (enteredPassword, storedHashedPassword) => {
    const match = await bcrypt.compare(enteredPassword, storedHashedPassword);
    return match;
  };
  
  // Example Usage:
  const storedHashedPassword = "$2b$10$edWu/JUfdyXfRxpDPAhmw.HXHQ5r/mANma9z19cnV7IPITKRTlFEK"; // Example hash
  const enteredPassword = "1234"; // User input
  
  comparePassword(enteredPassword, storedHashedPassword).then((isMatch) => {
    console.log(isMatch ? "✅ Password matches!" : "❌ Incorrect password!");
  });
  