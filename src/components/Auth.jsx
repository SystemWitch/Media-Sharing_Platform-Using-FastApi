import { useState } from "react";
import { login, register } from "../api";

export default function Auth({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const data = await login(username, password);
    localStorage.setItem("token", data.access_token);
    onLogin();
  }

  async function handleRegister() {
    await register(username, password);
    alert("Registered successfully. Now login.");
  }

  return (
    <div className="card">
      <h2>Login / Register</h2>
      <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
