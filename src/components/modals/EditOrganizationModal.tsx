"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Organization } from "@/config/database.types";
import { toast } from "sonner";
import { useUpdateOrganization } from "@/hooks/useAdminAPI";
import React from "react";

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization | null;
}

const organizationSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  code: z.string().min(2, { message: "Code must be at least 2 characters." }),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().optional(),
  logo_url: z.string().optional(),
  is_active: z.boolean().optional(),
  subscription_tier: z.string().optional(),
  max_users: z.number().optional(),
  billing_email: z.string().email().optional(),
  tax_id: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
});

type OrganizationSchemaType = z.infer<typeof organizationSchema>;

export default function EditOrganizationModal({
  isOpen,
  onClose,
  organization,
}: EditOrganizationModalProps) {
  const updateOrganization = useUpdateOrganization();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrganizationSchemaType>({
    resolver: zodResolver(organizationSchema),
    defaultValues: organization ? {
      name: organization.name,
      code: organization.code,
      description: organization.description || undefined,
      address: organization.address || undefined,
      phone: organization.phone || undefined,
      email: organization.email || undefined,
      website: organization.website || undefined,
      logo_url: organization.logo_url || undefined,
      is_active: organization.is_active,
      subscription_tier: organization.subscription_tier,
      max_users: organization.max_users,
      billing_email: organization.billing_email || undefined,
      tax_id: organization.tax_id || undefined,
      currency: organization.currency,
      timezone: organization.timezone,
    } : {},
    mode: "onChange",
  });

  // Reset form when organization changes
  React.useEffect(() => {
    if (organization) {
      reset({
        name: organization.name,
        code: organization.code,
        description: organization.description || undefined,
        address: organization.address || undefined,
        phone: organization.phone || undefined,
        email: organization.email || undefined,
        website: organization.website || undefined,
        logo_url: organization.logo_url || undefined,
        is_active: organization.is_active,
        subscription_tier: organization.subscription_tier,
        max_users: organization.max_users,
        billing_email: organization.billing_email || undefined,
        tax_id: organization.tax_id || undefined,
        currency: organization.currency,
        timezone: organization.timezone,
      });
    }
  }, [organization, reset]);

  const onSubmit = async (data: OrganizationSchemaType) => {
    if (!organization) {
      toast.error("No organization selected");
      return;
    }

    try {
      await updateOrganization.mutateAsync({
        organizationId: organization.id,
        updates: data,
        reason: "Organization updated via admin panel",
      });

      toast.success("Organization updated successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to update organization:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update organization"
      );
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="glass-card w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                    >
                      Edit Organization
                    </Dialog.Title>
                    <p className="text-sm text-gray-300 mt-1">
                      {organization
                        ? `Editing ${organization.name}`
                        : "No organization selected"}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-200 mb-2"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        {...register("name")}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                      />
                      {errors.name && (
                        <div className="flex items-center gap-1 mt-1">
                          <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-red-400 text-xs">
                            {errors.name.message}
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="code"
                        className="block text-sm font-medium text-gray-200 mb-2"
                      >
                        Code
                      </label>
                      <input
                        type="text"
                        id="code"
                        {...register("code")}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                      />
                      {errors.code && (
                        <div className="flex items-center gap-1 mt-1">
                          <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-red-400 text-xs">
                            {errors.code.message}
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-200 mb-2"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        {...register("description")}
                        rows={3}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200 resize-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="subscription_tier"
                        className="block text-sm font-medium text-gray-200 mb-2"
                      >
                        Subscription Tier
                      </label>
                      <select
                        id="subscription_tier"
                        {...register("subscription_tier")}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                      >
                        <option value="basic" className="bg-gray-800 text-white">Basic</option>
                        <option value="premium" className="bg-gray-800 text-white">Premium</option>
                        <option value="enterprise" className="bg-gray-800 text-white">Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="max_users"
                        className="block text-sm font-medium text-gray-200 mb-2"
                      >
                        Max Users
                      </label>
                      <input
                        type="number"
                        id="max_users"
                        {...register("max_users", { valueAsNumber: true })}
                        min="1"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-300 font-medium backdrop-blur-sm hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateOrganization.isPending}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {updateOrganization.isPending ? "Updating..." : "Update"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
