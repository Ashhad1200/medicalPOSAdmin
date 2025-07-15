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
    defaultValues: organization || {},
    mode: "onChange",
  });

  // Reset form when organization changes
  React.useEffect(() => {
    if (organization) {
      reset(organization);
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Edit Organization
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {organization
                      ? `Editing ${organization.name}`
                      : "No organization selected"}
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        {...register("name")}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="code"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Code
                      </label>
                      <input
                        type="text"
                        id="code"
                        {...register("code")}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      {errors.code && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.code.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        {...register("description")}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="subscription_tier"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Subscription Tier
                      </label>
                      <select
                        id="subscription_tier"
                        {...register("subscription_tier")}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="max_users"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Max Users
                      </label>
                      <input
                        type="number"
                        id="max_users"
                        {...register("max_users", { valueAsNumber: true })}
                        min="1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="bg-gray-200 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mr-2"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateOrganization.isPending}
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
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
