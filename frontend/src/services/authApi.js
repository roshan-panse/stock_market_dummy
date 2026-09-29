import { mock } from "./api.js";

export const authApi = {
  // Later: POST /auth/login/
  login: ({ email }) => mock({ username: email.split("@")[0], email }, 600),
  // Later: POST /auth/register/
  register: ({ username, email }) => mock({ username, email }, 600),
};
