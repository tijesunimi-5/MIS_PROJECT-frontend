"use client";

export default function DashboardPage() {
  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold">Dashboard</h1>

      <p className="mt-3 text-gray-600">Welcome to the MIS Dashboard</p>

      <div className="grid grid-cols-3 gap-5 mt-10">
        <div className="p-6 shadow rounded bg-white">
          <h2 className="text-2xl font-bold">Users</h2>

          <p>120</p>
        </div>

        <div className="p-6 shadow rounded bg-white">
          <h2 className="text-2xl font-bold">Revenue</h2>

          <p>$4,200</p>
        </div>

        <div className="p-6 shadow rounded bg-white">
          <h2 className="text-2xl font-bold">Reports</h2>

          <p>35</p>
        </div>
      </div>
    </div>
  );
}
