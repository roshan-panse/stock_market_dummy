const API_URL = import.meta.env.VITE_API_URL;

export const authApi = {
  login: async ({ username, password }) => {
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.non_field_errors?.[0] ||
        data?.detail ||
        "Invalid username or password"
      );
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);

    return data;
  },

  register: async ({ username, email, password }) => {
    const response = await fetch(`${API_URL}/auth/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.username?.[0] ||
        data?.email?.[0] ||
        data?.password?.[0] ||
        "Registration failed"
      );
    }

    return data;
  },
};