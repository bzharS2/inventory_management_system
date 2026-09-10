require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const db = require("./db");
const app = express();
const appRoutes = require(`./routes/appRoutes.js`);

app.use(helmet());
app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());

app.use('/app',appRoutes);

async function startServer() {
    try {
        await db.getConnection();
        console.log("Connected to MySQL!");
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });

    } catch (err) {
        console.error(err);
    }
}
startServer();
