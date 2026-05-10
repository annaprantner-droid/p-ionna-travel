import { LogOut, Mail, User as UserIcon } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function ProfilePage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="space-y-4 px-5 py-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-100 text-navy-700">
          <UserIcon size={28} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-navy-900">{user?.name}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
      </div>

      <Card className="p-4 text-sm">
        <div className="flex items-center gap-2 text-slate-700">
          <Mail size={16} className="text-slate-400" /> {user?.email}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">About this prototype</h3>
        <p className="text-sm text-slate-600">
          P-Ionna Travel is a prototype — your data lives in a local SQLite database and the AI assistant uses
          a mocked service. Replace <code className="rounded bg-slate-100 px-1">ai.service.ts</code> to wire up
          a real model later.
        </p>
      </Card>

      <Button variant="danger" fullWidth onClick={logout}>
        <LogOut size={16} /> Sign out
      </Button>
    </div>
  );
}
