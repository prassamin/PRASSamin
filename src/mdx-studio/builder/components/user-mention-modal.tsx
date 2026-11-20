"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal, cn } from "@heroui/react";
import {
  LuX,
  LuAtSign,
  LuImage,
  LuSearch,
  LuLink,
  LuUsers,
} from "react-icons/lu";
import { ImagePicker } from "@/components/image-picker";
import { MdxUser } from "@/components/mdx/mdx-user";
import { useUserMention } from "./user-mention-context";
import { UserMentionData } from "./user-mention-utils";
import { getMentionCandidatesAction, MentionCandidate } from "../actions";

const EMPTY: UserMentionData = { name: "", avatar: "", href: "", role: "" };

// Cached across modal openings for the session
let candidatesCache: MentionCandidate[] | null = null;

const inputCls =
  "w-full px-3 py-1.5 text-xs rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 transition-colors";

export const UserMentionModal: React.FC = () => {
  const { isOpen, target, closeMentionPicker, insertMention } = useUserMention();
  const [form, setForm] = useState<UserMentionData>(EMPTY);
  const [candidates, setCandidates] = useState<MentionCandidate[]>(
    candidatesCache ?? [],
  );
  const [search, setSearch] = useState("");
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);

  // Reset form on every new open (prefill from existing tag / selected text)
  useEffect(() => {
    if (isOpen) {
      setForm({ ...EMPTY, ...(target?.initial ?? {}) });
      setSearch("");
    }
  }, [isOpen, target]);

  // Lazy-load suggestions once
  useEffect(() => {
    if (!isOpen || candidatesCache) return;
    let cancelled = false;
    getMentionCandidatesAction().then((list) => {
      candidatesCache = list;
      if (!cancelled) setCandidates(list);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return candidates.slice(0, 12);
    return candidates
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [candidates, search]);

  const set = (key: keyof UserMentionData, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const canSubmit = form.name.trim().length > 0;
  const submit = () => {
    if (canSubmit) insertMention(form);
  };

  if (!isOpen && !isImagePickerOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen && !isImagePickerOpen}
        onOpenChange={(open) => !open && !isImagePickerOpen && closeMentionPicker()}
      >
        <Modal.Backdrop
          data-lenis-prevent
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <Modal.Container data-lenis-prevent>
            <Modal.Dialog
              data-lenis-prevent
              className="max-w-xl w-[calc(100vw-32px)] max-h-[85vh] flex flex-col p-0 overflow-hidden border border-white/10 rounded-2xl shadow-2xl text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-white/2">
                <div className="flex items-center gap-2.5">
                  <LuAtSign className="w-4 h-4 text-sky-400" />
                  <div className="flex flex-col">
                    <h3 className="text-sm font-semibold text-white tracking-wide">
                      {target?.isEditing ? "Edit User Mention" : "Mention User"}
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Inline pill with avatar &amp; name — flows inside text
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeMentionPicker}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <LuX className="w-4 h-4" />
                </button>
              </div>

              <div
                data-lenis-prevent
                className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4"
              >
                {/* Pick existing */}
                {candidates.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <LuUsers className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                        Pick existing
                      </span>
                      <div className="relative flex-1">
                        <LuSearch className="w-3 h-3 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search people..."
                          className={cn(inputCls, "pl-7 py-1")}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {filtered.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              name: c.name,
                              avatar: c.avatar,
                              role: c.role,
                            }))
                          }
                          className={cn(
                            "inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full border text-[11px] transition-colors cursor-pointer",
                            form.name === c.name
                              ? "bg-sky-500/15 border-sky-400/40 text-sky-200"
                              : "bg-white/4 border-white/10 text-neutral-300 hover:bg-white/8",
                          )}
                        >
                          <img
                            src={c.avatar}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          {c.name}
                        </button>
                      ))}
                      {filtered.length === 0 && (
                        <span className="text-[11px] text-neutral-500">
                          No matches — fill the fields below manually.
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Manual fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      autoFocus
                      type="text"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          submit();
                        }
                      }}
                      placeholder="Jane Doe"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value={form.role ?? ""}
                      onChange={(e) => set("role", e.target.value)}
                      placeholder="Senior Engineer, Acme"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                      <LuImage className="w-3.5 h-3.5 text-neutral-400" />
                      Avatar URL
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={form.avatar ?? ""}
                        onChange={(e) => set("avatar", e.target.value)}
                        placeholder="https://..."
                        className={cn(inputCls, "flex-1")}
                      />
                      <button
                        type="button"
                        onClick={() => setIsImagePickerOpen(true)}
                        title="Choose from media library"
                        className="p-2 rounded-xl bg-white/6 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
                      >
                        <LuImage className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                      <LuLink className="w-3.5 h-3.5 text-neutral-400" />
                      Profile Link
                    </label>
                    <input
                      type="text"
                      value={form.href ?? ""}
                      onChange={(e) => set("href", e.target.value)}
                      placeholder="https://github.com/jane"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Live preview */}
                <div className="rounded-xl border border-white/8 bg-black/25 px-4 py-3 text-sm text-neutral-300 leading-relaxed">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block mb-1.5">
                    Preview
                  </span>
                  Huge thanks to{" "}
                  <MdxUser
                    name={form.name || "User"}
                    avatar={form.avatar}
                    role={form.role}
                    bio={form.bio}
                  />{" "}
                  for reviewing this post.
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/8 bg-white/2">
                <button
                  type="button"
                  onClick={closeMentionPicker}
                  className="px-3 py-1.5 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={submit}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/90 hover:bg-sky-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {target?.isEditing ? "Update Mention" : "Insert Mention"}
                </button>
              </div>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <ImagePicker
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelectImage={(data) => {
          set("avatar", data.src);
          setIsImagePickerOpen(false);
        }}
        currentSrc={form.avatar}
      />
    </>
  );
};
