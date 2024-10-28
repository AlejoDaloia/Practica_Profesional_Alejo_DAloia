const mysql = require("promise-mysql");
const dotenv = require("dotenv");
dotenv.config();

let connection; // Variable para almacenar la conexión

const connectDB = async () => {
    if (!connection) {
        console.log("Intentando conectar a la base de datos...");
        connection = await mysql.createConnection({
            host: process.env.HOST,
            database: process.env.DATABASE,
            user: process.env.USER,
            password: process.env.PASSWORD
        });
        console.log("Conexión establecida con éxito.");
    }
    return connection;
};

module.exports = {
    connectDB // Exporta la función connectDB
};