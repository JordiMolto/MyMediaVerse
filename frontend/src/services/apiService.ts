import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:4000/api', // La URL base de tu backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- COMENTARIOS PARA TI ---
// Interceptor para añadir el token JWT a las cabeceras si existe
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('user-token'); // O donde guardes tu token
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Interceptor de respuesta para manejar errores globales (ej: 401 Unauthorized)
// apiClient.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.response && error.response.status === 401) {
//       // Lógica para desloguear al usuario o refrescar token
//       // localStorage.removeItem('user-token');
//       // window.location.href = '/login';
//       console.error("Error 401: No autorizado. Redirigir a login.");
//     }
//     return Promise.reject(error);
//   }
// );
// --------------------------

export default {
  // --- COMENTARIOS PARA TI: Métodos CRUD genéricos o específicos ---
  // Ejemplo para películas:
  // getMovies() {
  //   return apiClient.get('/movies');
  // },
  // getMovie(id: number) {
  //   return apiClient.get(`/movies/${id}`);
  // },
  // createMovie(data: any) { // Deberías usar tu tipo Movie/Entrada aquí
  //   return apiClient.post('/movies', data);
  // },
  // updateMovie(id: number, data: any) {
  //   return apiClient.put(`/movies/${id}`, data);
  // },
  // deleteMovie(id: number) {
  //   return apiClient.delete(`/movies/${id}`);
  // },

  // Métodos genéricos (puedes adaptarlos)
  get(resource: string, params?: any) {
    return apiClient.get(resource, { params });
  },
  post(resource: string, data: any) {
    return apiClient.post(resource, data);
  },
  put(resource: string, data: any) {
    return apiClient.put(resource, data);
  },
  delete(resource: string) {
    return apiClient.delete(resource);
  }
  // ... más métodos para series, animes, auth, etc.
}; 