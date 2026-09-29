// Later: replace `mock()` with real fetch calls to Django, e.g.
//   fetch(`${import.meta.env.VITE_API_URL}/stocks/`)
// Every other service file goes through here, so only this file needs to change.
export const BASE_URL = import.meta.env.VITE_API_URL;

export const mock = (data, delay = 400) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), delay));

export const mockError = (message) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), 400));
