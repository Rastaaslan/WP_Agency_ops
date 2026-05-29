import type { UserNotice as UserNoticeData } from "@/lib/user-notice";

export function UserNotice({ notice }: { notice: UserNoticeData | null }) {
  if (!notice) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900"
      role="status"
    >
      <p className="font-medium">{notice.title}</p>
      <p>{notice.message}</p>
    </div>
  );
}
