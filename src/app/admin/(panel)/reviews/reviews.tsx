"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { CheckCircle2, EyeOff, Pencil, Quote, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteReview, saveReview, type ReviewField } from "@/app/admin/actions";
import { AdminCard } from "@/components/admin/AdminShell";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MAX_REVIEWS, MIN_REVIEWS_TO_SHOW, type Review } from "@/lib/types";

export function Reviews({ reviews }: { reviews: Review[] }) {
  const [editing, setEditing] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<Review | null>(null);
  const [deleting, startDelete] = useTransition();
  const live = reviews.length >= MIN_REVIEWS_TO_SHOW;
  const full = reviews.length >= MAX_REVIEWS;

  return (
    <div className="space-y-6">
      <div className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${live ? "border-success/30 bg-success/5" : "border-border bg-background"}`}>
        {live ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> : <EyeOff className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
        <p>
          <span className="font-semibold">{reviews.length} of {MAX_REVIEWS} reviews.</span>{" "}
          {live
            ? "The client stories carousel is live on the home page."
            : `The home page shows reviews once there are at least ${MIN_REVIEWS_TO_SHOW}. Add ${MIN_REVIEWS_TO_SHOW - reviews.length} more to publish them.`}
        </p>
      </div>

      {full ? (
        <p className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">You&apos;ve reached the {MAX_REVIEWS}-review limit. Delete a review to add a new one.</p>
      ) : (
        <AdminCard title="Add a review">
          <ReviewForm />
        </AdminCard>
      )}

      <AdminCard title={`Reviews (${reviews.length})`}>
        {reviews.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No reviews yet. Add what past clients have said about working with Haley.</p>
        ) : (
          <ul className="divide-y divide-border">
            {reviews.map((r) =>
              editing === r.id ? (
                <li key={r.id}><ReviewForm existing={r} onDone={() => setEditing(null)} /></li>
              ) : (
                <li key={r.id} className="flex gap-4 px-5 py-4">
                  <Quote className="mt-1 size-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed">{r.quote}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground"><span className="font-semibold text-foreground">{r.name}</span>{r.place ? ` · ${r.place}` : ""}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => setEditing(r.id)} aria-label={`Edit review from ${r.name}`} className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="size-4" /></button>
                    <button onClick={() => setToDelete(r)} aria-label={`Delete review from ${r.name}`} className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="size-4" /></button>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </AdminCard>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this review?</AlertDialogTitle>
            <AlertDialogDescription>
              The review from {toDelete?.name} will be removed from the site.
              {reviews.length === MIN_REVIEWS_TO_SHOW && ` With fewer than ${MIN_REVIEWS_TO_SHOW} reviews, the section will be hidden from the home page.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                if (!toDelete) return;
                startDelete(async () => {
                  const res = await deleteReview(toDelete.id);
                  if (res.ok) toast.success("Review deleted", { description: toDelete.name });
                  else toast.error(res.error);
                  setToDelete(null);
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ReviewForm({ existing, onDone }: { existing?: Review; onDone?: () => void }) {
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Partial<Record<ReviewField, string>>>({});
  const [saving, startSave] = useTransition();

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startSave(async () => {
      const res = await saveReview(existing?.id ?? null, fd);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
        return;
      }
      setErrors({});
      toast.success(existing ? "Review updated" : "Review added");
      if (existing) onDone?.();
      else form.current?.reset();
    });
  };

  return (
    <form ref={form} onSubmit={submit} noValidate className="grid gap-4 p-5">
      <Field label="What the client said *" err={errors.quote}>
        <textarea name="quote" defaultValue={existing?.quote} rows={3} maxLength={600} className="field" placeholder="Haley made selling our home in Sussex easy from start to finish…" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Client name *" err={errors.name}><input name="name" defaultValue={existing?.name} maxLength={100} className="field" placeholder="Jamie & Alex M." /></Field>
        <Field label="Location" err={errors.place}><input name="place" defaultValue={existing?.place ?? ""} maxLength={100} className="field" placeholder="Sussex, NB" /></Field>
      </div>
      <div className="flex justify-end gap-2">
        {existing && <button type="button" onClick={onDone} className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>}
        <button disabled={saving} className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {saving ? "Saving…" : existing ? "Save review" : "Add review"}
        </button>
      </div>
    </form>
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
