import { jwtDecode } from "jwt-decode";

export function getCurrentUsername() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.sub;
  } catch {
    return null;
  }
}
