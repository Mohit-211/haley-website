import { requireUser } from "@/lib/auth/dal";
import { ROLE_LABEL } from "@/lib/types";

export async function CurrentUser() {
  const user = await requireUser();
  const initials = user.name.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-tight">{user.name}</p>
        <p className="text-xs text-muted-foreground">{ROLE_LABEL[user.role]} · {user.email}</p>
      </div>
      <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{initials}</div>
    </div>
  );
}
