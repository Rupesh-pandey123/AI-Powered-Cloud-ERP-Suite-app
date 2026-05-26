"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../../services/authservice";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const data = await loginUser(email, password);

      console.log(data);

      // token save
      localStorage.setItem("token", data.token);

      alert("Login Successful");

      router.push("/dashboard");
    } catch (error) {
      alert("Login Failed");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-[400px]">
        <h1 className="text-3xl font-bold mb-6 text-center">
          ERP Login
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
          onClick={handleLogin}
          className="w-full bg-black text-white p-3 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}