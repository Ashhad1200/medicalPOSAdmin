"use client";

import { useParams } from "next/navigation";
import { useOrganization, useOrganizationLedger } from "@/hooks/useAdminAPI";
import AdminLayout from "@/components/layout/AdminLayout";
import { useState } from "react";
import AddOrganizationLedgerEntryModal from "@/components/modals/AddOrganizationLedgerEntryModal";
import Link from "next/link";

export default function OrganizationDetailPage() {
  const params = useParams();
  const organizationId = params?.id as string | undefined;

  const { data: organization, isLoading: orgLoading } = useOrganization(organizationId || "");
  const {
    data: ledger,
    isLoading: ledgerLoading,
    error: ledgerError,
  } = useOrganizationLedger(organizationId);

  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="glass-card rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/organizations"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Organization Details</h1>
              <p className="text-white/70">Manage organization information and financial ledger</p>
            </div>
          </div>
        </div>
      </div>

      {orgLoading && (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-white/70">Loading organization details...</p>
        </div>
      )}
      
      {organization && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Organization Info */}
          <div className="lg:col-span-2 glass-card rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                  {organization.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{organization.name}</h2>
                  <p className="text-white/60">{organization.description || 'No description provided'}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsLedgerModalOpen(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Entry</span>
                </button>
              </div>
            </div>

            {/* Organization Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9l14 0M4 15l14 0" />
                  </svg>
                  <span className="text-white/60 text-sm">Organization Code</span>
                </div>
                <p className="text-white font-medium font-mono">{organization.code}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-white/60 text-sm">Subscription Tier</span>
                </div>
                <p className="text-white font-medium capitalize">{organization.subscription_tier}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span className="text-white/60 text-sm">User Allocation</span>
                </div>
                <p className="text-white font-medium">{organization.current_users}/{organization.max_users}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white/60 text-sm">Access Valid Until</span>
                </div>
                <p className="text-white font-medium">
                  {organization.access_valid_till 
                    ? new Date(organization.access_valid_till).toLocaleDateString()
                    : 'No expiration'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${organization.is_active ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <h3 className="text-lg font-semibold text-white">Organization Status</h3>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                  organization.is_active
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {organization.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h3 className="text-lg font-semibold text-white">User Usage</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Current Users</span>
                  <span className="text-white font-medium">{organization.current_users}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      organization.current_users >= organization.max_users
                        ? "bg-red-500"
                        : organization.current_users >= organization.max_users * 0.8
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min((organization.current_users / organization.max_users) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Available</span>
                  <span className="text-white font-medium">{organization.max_users - organization.current_users}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Ledger Section */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Financial Ledger</h2>
              <p className="text-white/60">Organization transaction history and balance tracking</p>
            </div>
          </div>
        </div>

        {ledgerLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
            <p className="mt-4 text-white/70">Loading ledger entries...</p>
          </div>
        )}

        {ledgerError && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400 font-medium">Error loading ledger entries</span>
            </div>
          </div>
        )}

        {ledger && ledger.length === 0 && !ledgerLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Transactions</h3>
            <p className="text-white/60 mb-4">This organization has no transaction history yet.</p>
            <button
              onClick={() => setIsLedgerModalOpen(true)}
              className="btn-primary"
            >
              Add First Entry
            </button>
          </div>
        )}

        {ledger && ledger.length > 0 && (
          <div className="space-y-3">
            {ledger.map((entry: any) => (
              <div
                key={entry.id}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      entry.transactionType === 'credit' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {entry.transactionType === 'credit' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        )}
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{entry.description}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-white/60 text-sm">
                          {new Date(entry.transactionDate).toLocaleDateString()}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          entry.transactionType === 'credit'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {entry.transactionType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      entry.transactionType === 'credit' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {entry.transactionType === 'credit' ? '+' : '-'}${Math.abs(entry.amount)}
                    </div>
                    <div className="text-white/60 text-sm">
                      Balance: ${entry.runningBalance}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddOrganizationLedgerEntryModal
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
        organizationId={organizationId || ""}
        organizationName={organization?.name || ""}
      />
    </AdminLayout>
  );
}