"use client";

import { useState } from "react";
import { registerUser } from "@/services/authservice";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {

    if (!email || !password) {
      alert("All fields required");
      return;
    }
    if (!email.includes("@")) {
  alert("Invalid email");
  return;
}

    try {
  setLoading(true);

  await registerUser(email, password);

  alert("Registration Successful");
  window.location.href = "/login";

} catch (error) {
  alert("Registration Failed");
} finally {
  setLoading(false);
}
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-[400px]">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Register
        </h1>

        <input
          type="email"
          placeholder="Enter Email"
          className="w-full border p-3 rounded mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          className="w-full border p-3 rounded mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
  onClick={handleRegister}
  disabled={loading}
  className="w-full border p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  {loading ? "Loading..." : "Register"}
</button>
      </div>
    </div>
  );
}