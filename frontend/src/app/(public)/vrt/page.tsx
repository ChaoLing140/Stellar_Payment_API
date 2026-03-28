"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import CopyButton from "@/components/CopyButton";

export default function VRTPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black p-10 text-white">
      <h1 className="mb-8 font-mono text-xl text-mint">VRT Core Components</h1>

      <section className="mb-10 space-y-4" id="vrt-buttons">
        <h2 className="text-lg font-bold">Buttons</h2>
        <div className="flex gap-4">
          <Button variant="primary" data-testid="vrt-btn-primary">Primary Button</Button>
          <Button variant="secondary" data-testid="vrt-btn-secondary">Secondary Button</Button>
          <Button variant="primary" isLoading data-testid="vrt-btn-loading">Primary Loading</Button>
          <Button variant="primary" disabled data-testid="vrt-btn-disabled">Disabled</Button>
        </div>
        <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <span className="font-mono text-sm text-mint" data-testid="vrt-copy-value">
            sk_test_vrt_copy_glitch_signal
          </span>
          <CopyButton text="sk_test_vrt_copy_glitch_signal" className="shrink-0" />
        </div>
      </section>

      <section className="mb-10 space-y-4 max-w-sm" id="vrt-inputs">
        <h2 className="text-lg font-bold">Inputs</h2>
        <Input label="Email Address" placeholder="Enter your email" data-testid="vrt-input-default" />
        <Input label="Disabled Input" value="Cannot edit me" disabled data-testid="vrt-input-disabled" />
      </section>

      <section className="mb-10 space-y-4" id="vrt-modals">
        <h2 className="text-lg font-bold">Modals</h2>
        <Button variant="secondary" onClick={() => setIsModalOpen(true)} data-testid="open-modal-btn">
          Open VRT Modal
        </Button>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="VRT Check">
          <p className="mb-4">This is a modal used for Visual Regression Testing.</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm</Button>
          </div>
        </Modal>
      </section>
    </div>
  );
}
