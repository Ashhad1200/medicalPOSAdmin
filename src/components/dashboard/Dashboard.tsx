"use client";

import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user, appUser, signOut } = useAuth();

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {appUser?.name || user?.email}
            </h1>
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Organization
              </h3>
              <p className="text-blue-700">
                {appUser?.organization?.name || "No organization"}
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Role
              </h3>
              <p className="text-green-700">
                {appUser?.role || "No role assigned"}
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Status
              </h3>
              <p className="text-purple-700">
                {appUser?.is_active ? "Active" : "Inactive"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-lg text-center">
                <div className="text-lg font-semibold">Users</div>
                <div className="text-sm opacity-90">Manage users</div>
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center">
                <div className="text-lg font-semibold">Inventory</div>
                <div className="text-sm opacity-90">Manage inventory</div>
              </button>
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white p-4 rounded-lg text-center">
                <div className="text-lg font-semibold">Orders</div>
                <div className="text-sm opacity-90">View orders</div>
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg text-center">
                <div className="text-lg font-semibold">Reports</div>
                <div className="text-sm opacity-90">View reports</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
