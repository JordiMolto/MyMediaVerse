const mysql = require("promise-mysql");
const dotenv = require("dotenv");

dotenv.config();

const dbConfig = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
};

const getConnection = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
    // Relanzamos el error para que sea manejado por quien llama a la función
    throw error;
  }
};

module.exports = { getConnection };
