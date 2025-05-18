const mysql = require("promise-mysql");
const dotenv = require("dotenv");

dotenv.config({ path: require('path').resolve(__dirname, '../../.env') }); // Asegúrate que .env se lee desde la raíz de backend/

const dbConfig = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE, // Asegúrate que esta variable de entorno esté definida
};

const getConnection = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
    throw error;
  }
};

module.exports = { getConnection }; 