"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  // 🔒 Protected Route
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    }
  }, []);

  // 🔓 Logout Function
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <div className="w-[250px] bg-black text-white p-6">
        <h1 className="text-2xl font-bold mb-10">
          ERP Dashboard
        </h1>

        <ul className="space-y-5 text-lg">
          <li className="cursor-pointer hover:text-gray-300">
            Dashboard
          </li>

          <li className="cursor-pointer hover:text-gray-300">
            Employees
          </li>

          <li className="cursor-pointer hover:text-gray-300">
            Finance
          </li>

          <li className="cursor-pointer hover:text-gray-300">
            Inventory
          </li>
        </ul>
      </div>
{/* Navbar */}
<div className="flex justify-between items-center bg-white p-4 rounded-lg shadow mb-6">
  
  <h2 className="text-xl font-semibold">
    Dashboard
  </h2>

  <div className="flex items-center gap-4">
    <span className="font-medium">
      Welcome, User 👋
    </span>

    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
    >
      Logout
    </button>
  </div>

</div>
      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6">

        {/* 🔴 Logout Button */}
        <div className="flex justify-end mb-5">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <h1 className="text-4xl font-bold mb-10">
          Welcome to ERP Dashboard
        </h1>

        {/* Cards */}
        <div className="grid grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold">
              Total Employees
            </h2>
            <p className="text-4xl font-bold mt-4 text-blue-600">
              120
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold">
              Revenue
            </h2>
            <p className="text-4xl font-bold mt-4 text-green-600">
              $50K
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold">
              Inventory
            </h2>
            <p className="text-4xl font-bold mt-4 text-purple-600">
              350
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}