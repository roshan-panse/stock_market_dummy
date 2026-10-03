const API_URL = import.meta.env.VITE_API_URL;

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Token ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      "Something went wrong"
    );
  }

  return data;
};

// Temporary mock helper.
// We will remove this after converting the remaining services.
export const mock = (value, delay = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), delay);
  });
};