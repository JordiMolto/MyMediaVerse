const app = require('./app');
const dotenv = require('dotenv');

// Configurar dotenv para que lea el archivo .env en la raíz de la carpeta 'backend'
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
  // --- COMENTARIOS PARA TI ---
  // Aquí podrías tener una función que intente conectar a la BD al iniciar,
  // pero getConnection() ya lo hace por petición.
  // Si usas Prisma, inicializarías PrismaClient aquí o lo importarías.
  // Ejemplo con una función de prueba de conexión:
  // const { getConnection } = require('./config/database');
  // getConnection().then(conn => {
  //   console.log('Successfully connected to the database on startup.');
  //   conn.end();
  // }).catch(err => {
  //   console.error('Failed to connect to the database on startup:', err);
  // });
  // --------------------------
}); 