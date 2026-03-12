"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { AddSeedModal } from "./AddSeedModal";

export function SeedsToolbar() {
  const router = useRouter();
  const { user } = useAuth();
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <>
      {user != null && (
        <div className="skins-toolbar">
          <div className="skins-actions">
            <button type="button" className="skins-action-btn" onClick={() => setAddModalOpen(true)}>
              Добавить
            </button>
          </div>
        </div>
      )}
      <AddSeedModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSuccess={() => router.refresh()} />
    </>
  );
}
