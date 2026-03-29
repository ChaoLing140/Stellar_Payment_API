"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useMerchantLogout } from "@/lib/merchant-store";
import { Modal } from "@/components/ui/Modal";

interface DangerZoneProps {
  apiKey: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function DangerZone({ apiKey }: DangerZoneProps) {
  const router = useRouter();
  const logout = useMerchantLogout();
  
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/merchants`, {
        method: "DELETE",
        headers: { "x-api-key": apiKey },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete account");
      }

      toast.success("Account successfully deleted");
      logout();
      router.push("/register");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete account";
      toast.error(msg);
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-medium uppercase tracking-wider text-red-500">
          Danger Zone
        </h2>
        <p className="text-sm text-slate-500">
          Irreversible actions that affect your entire account.
        </p>
      </div>

      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-white">Delete Account</h3>
            <p className="text-xs text-slate-400">
              Permanently remove your merchant account and all associated data. This action cannot be undone.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFirstModalOpen(true)}
            className="flex h-10 w-fit items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 px-4 text-xs font-bold text-red-400 transition-all hover:bg-red-500/20"
          >
            Delete Account...
          </button>
        </div>
      </div>

      <Modal
        isOpen={isFirstModalOpen}
        onClose={() => setIsFirstModalOpen(false)}
        title="Delete Account"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-slate-300">
              Are you absolutely sure you want to delete your account? 
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-400 space-y-2">
              <li>All your account information will be immediately revoked.</li>
              <li>You will lose access to your payment history.</li>
              <li>This action is permanent and cannot be reversed.</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsFirstModalOpen(false);
                setIsSecondModalOpen(true);
              }}
              className="flex-1 h-10 rounded-xl bg-red-600 font-bold text-white text-sm transition-all hover:bg-red-700"
            >
              Continue
            </button>
            <button
              onClick={() => setIsFirstModalOpen(false)}
              className="flex-1 h-10 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-slate-300 transition-all hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isSecondModalOpen}
        onClose={() => {
          setIsSecondModalOpen(false);
          setDeleteConfirmation("");
        }}
        title="Final Confirmation"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-slate-300 font-medium">
              Sensitive Action: Type <span className="text-white font-bold underline">DELETE</span> below to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-sm text-white placeholder-slate-600 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== "DELETE" || isDeleting}
              className="flex-1 h-10 rounded-xl bg-red-600 font-bold text-white text-sm transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Permanently Delete Account"}
            </button>
            <button
              onClick={() => {
                setIsSecondModalOpen(false);
                setDeleteConfirmation("");
              }}
              disabled={isDeleting}
              className="flex-1 h-10 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-slate-300 transition-all hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
