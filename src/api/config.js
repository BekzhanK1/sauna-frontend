const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const API_URLS = {
  login: `${API_BASE_URL}/users/token/`,
  refresh: `${API_BASE_URL}/users/token/refresh/`,
  me: `${API_BASE_URL}/users/me/`,
  users: `${API_BASE_URL}/users/users/`,
  bookings: `${API_BASE_URL}/bookings/bookings/`,
  bathhouses: `${API_BASE_URL}/users/bathhouses/`,
  rooms: `${API_BASE_URL}/users/rooms/`,
  bathhouseItems: `${API_BASE_URL}/users/bathhouse-items/`,
  menuCategories: `${API_BASE_URL}/users/menu-categories/`,
  // другие эндпоинты
};

export default API_URLS;
