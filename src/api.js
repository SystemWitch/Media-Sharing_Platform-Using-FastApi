const API_URL = "http://localhost:8000";

/* ================= AUTH ================= */

export async function register(username, password) {
  const res = await fetch("http://localhost:8000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
}


export async function login(username, password) {
  const body = new URLSearchParams();
  body.append("username", username);
  body.append("password", password);

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

function getToken() {
  return localStorage.getItem("token");
}

/* ================= MEDIA ================= */

export async function fetchMedia() {
  const res = await fetch(`${API_URL}/media`);
  if (!res.ok) throw new Error("Failed to load media");
  return res.json();
}

export async function uploadMedia(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: form,
  });

  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function deleteMedia(id) {
  const res = await fetch(`${API_URL}/media/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) throw new Error("Delete failed");
}
