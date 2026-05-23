
// import "./config/passport.js";
import { connectDB } from "./config/db.js";
import app from "./app.js";


// ============ database connection ============
connectDB();

// ============ Start server ============
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ============ Error Handling ============
process.on("unhandledRejection", (err) => {
    console.log(`unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
}); 

process.on("uncaughtException", (err) => {
    console.log(`uncaught Exception: ${err.message}`);
    process.exit(1);
});

export default app;