"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { Info, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { createStaff, deleteStaff, type StaffField } from "@/app/admin/actions";
import { AdminCard } from "@/components/admin/AdminShell";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { fmtDate } from "@/lib/data";
import { ROLE_LABEL, ROLES, type Role, type StaffMember } from "@/lib/types";

const ROLE_INFO: Record<Role, { icon: typeof ShieldCheck; can: string }> = {
  super_admin: { icon: ShieldCheck, can: "Full access, including adding and removing staff accounts." },
  employee: { icon: UserRound, can: "Manage listings, leads, enquiries and locations. Can't add or remove staff." },
};

export function Staff({ staff, me }: { staff: StaffMember[]; me: { id: number; role: Role } }) {
  const isSuper = me.role === "super_admin";
  const [toRemove, setToRemove] = useState<StaffMember | null>(null);
  const [removing, startRemove] = useTransition();

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {ROLES.map((r) => {
          const { icon: Icon, can } = ROLE_INFO[r];
          return (
            <div key={r} className="flex gap-3 rounded-lg border border-border bg-background p-4">
              <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">{ROLE_LABEL[r]}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{can}</p>
              </div>
            </div>
          );
        })}
      </div>

      {isSuper ? (
        <AddStaffForm />
      ) : (
        <p className="flex items-center gap-2 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
          <Info className="size-4 shrink-0" /> You&apos;re signed in as an employee. Only super admins can add or remove staff.
        </p>
      )}

      <AdminCard title={`Team (${staff.length})`}>
        <ul className="divide-y divide-border">
          {staff.map((s) => {
            const self = s.id === me.id;
            return (
              <li key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{s.name.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.name}{self && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.email} · added {fmtDate(s.createdAt)}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.role === "super_admin" ? "bg-primary/10 text-primary" : "bg-muted text-foreground"}`}>{ROLE_LABEL[s.role]}</span>
                {isSuper && (
                  <button
                    onClick={() => setToRemove(s)}
                    disabled={self}
                    title={self ? "You can't remove your own account" : `Remove ${s.name}`}
                    aria-label={`Remove ${s.name}`}
                    className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive disabled:pointer-events-none disabled:opacity-30"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </AdminCard>

      <AlertDialog open={!!toRemove} onOpenChange={(o) => !o && setToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {toRemove?.name}?</AlertDialogTitle>
            <AlertDialogDescription>They&apos;ll be signed out immediately and won&apos;t be able to sign in again.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={removing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                if (!toRemove) return;
                startRemove(async () => {
                  const res = await deleteStaff(toRemove.id);
                  if (res.ok) toast.success("Staff member removed", { description: toRemove.name });
                  else toast.error(res.error);
                  setToRemove(null);
                });
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AddStaffForm() {
  const form = useRef<HTMLFormElement>(null);
  const [role, setRole] = useState<Role>("employee");
  const [errors, setErrors] = useState<Partial<Record<StaffField, string>>>({});
  const [saving, startSave] = useTransition();

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startSave(async () => {
      const res = await createStaff(fd);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
        return;
      }
      setErrors({});
      setRole("employee");
      form.current?.reset();
      toast.success("Staff member added", { description: res.message });
    });
  };

  return (
    <AdminCard title="Add staff member">
      <form ref={form} onSubmit={submit} noValidate className="grid gap-4 p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Full name" err={errors.name}><input name="name" className="field" autoComplete="off" /></Field>
          <Field label="Email" err={errors.email}><input name="email" type="email" className="field" autoComplete="off" /></Field>
          <Field label="Temporary password" err={errors.password}><input name="password" type="password" className="field" autoComplete="new-password" placeholder="10+ characters" /></Field>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Role</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {ROLES.map((r) => {
              const { icon: Icon, can } = ROLE_INFO[r];
              return (
                <label key={r} className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors ${role === r ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30"}`}>
                  <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />
                  <Icon className={`mt-0.5 size-5 shrink-0 ${role === r ? "text-primary" : "text-muted-foreground"}`} />
                  <span>
                    <span className="block text-sm font-semibold">{ROLE_LABEL[r]}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{can}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Share the temporary password with them privately.</p>
          <button disabled={saving} className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{saving ? "Adding…" : "Add staff member"}</button>
        </div>
      </form>
    </AdminCard>
  );
}

function Field({ label, err, children }: { label: string; err?: string | undefined; children: React.ReactNode }) {
  return (
    <label className="grid content-start gap-1.5 text-sm font-medium">
      {label}
      {children}
      {err && <span className="text-xs font-normal text-destructive">{err}</span>}
    </label>
  );
}
