"use client";

import { useParams } from "next/navigation";
import { useUser, useUserLedger } from "@/hooks/useAdminAPI";
import AdminLayout from "@/components/layout/AdminLayout";
import { useState } from "react";
import AddLedgerEntryModal from "@/components/modals/AddLedgerEntryModal";
import UserAccessModal from "@/components/modals/UserAccessModal";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params?.id as string | undefined;

  const { data: user, isLoading: userLoading } = useUser(userId || "");
  const {
    data: ledger,
    isLoading: ledgerLoading,
    error: ledgerError,
  } = useUserLedger(userId);

  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  return (
    <AdminLayout>
      <h2 className="text-2xl font-semibold mb-4">User Detail</h2>

      {userLoading && <p>Loading user...</p>}
      {user && (
        <div className="bg-white rounded shadow p-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium mb-2">{user.username}</h3>
              <p className="text-sm">Email: {user.email}</p>
              <p className="text-sm capitalize">Role: {user.role}</p>
              <p className="text-sm">Organization: {user.organization?.name}</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm">
                  Status:
                  <span
                    className={`ml-1 px-2 py-1 rounded text-xs ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </p>
                <p className="text-sm">
                  Subscription:
                  <span
                    className={`ml-1 px-2 py-1 rounded text-xs ${
                      user.subscriptionStatus === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.subscriptionStatus}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsLedgerModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm"
              >
                Add Ledger Entry
              </button>
              <button
                onClick={() => setIsAccessModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm"
              >
                Manage Access
              </button>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold mb-2">Ledger</h3>
      {ledgerLoading && <p>Loading ledger...</p>}
      {ledgerError && (
        <p className="text-red-600">{(ledgerError as Error).message}</p>
      )}
      {ledger && ledger.length === 0 && <p>No ledger entries.</p>}
      {ledger && ledger.length > 0 && (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {new Date(entry.transactionDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 capitalize">
                    {entry.transactionType}
                  </td>
                  <td className="px-4 py-2">{entry.description}</td>
                  <td className="px-4 py-2 text-right">{entry.amount}</td>
                  <td className="px-4 py-2 text-right">
                    {entry.runningBalance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddLedgerEntryModal
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
        userId={userId || ""}
        userName={user?.username || ""}
      />

      <UserAccessModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        user={user}
      />
    </AdminLayout>
  );
}
