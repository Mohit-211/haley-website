"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Lock } from "lucide-react";
import { login } from "@/app/admin/actions";

export function Login() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 font-sans">
      <div className="w-full max-w-sm">
        <form action={action} className="rounded-lg border border-border bg-background p-8">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Lock className="size-4" /></span>
            <div>
              <p className="font-display text-lg leading-tight">Haley Bettle<span className="text-primary">.</span></p>
              <p className="text-xs text-muted-foreground">Admin console</p>
            </div>
          </div>
          <h1 className="mt-8 text-xl font-semibold">Sign in</h1>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium">Email
              <input type="email" name="email" required defaultValue={state?.email} className="field" autoComplete="username" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">Password
              <input type="password" name="password" required className="field" autoComplete="current-password" />
            </label>
            {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
            <button disabled={pending} className="rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">Accounts are created by a super admin from the Staff page.</p>
        <Link href="/" className="mt-2 block text-center text-xs text-muted-foreground hover:text-foreground">← Back to website</Link>
      </div>
    </div>
  );
}
