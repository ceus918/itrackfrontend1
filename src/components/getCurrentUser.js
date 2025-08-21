// Utility to get user info from session (for client)
import axios from 'axios';

export async function getCurrentUser() {
  try {
  const res = await axios.get("http://localhost:8000/api/checkAuth", { withCredentials: true });
    if (res.data.authenticated) {
      return res.data.user;
    }
    return null;
  } catch {
    return null;
  }
}

