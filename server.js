const express = require("express");

const dotenv = require("dotenv");
const { checkDays } = require("./services/checkdays");
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.get("/check_status/", checkDays);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
