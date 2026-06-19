import Link from "next/link";

export default function AdminRegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="max-w-xl bg-surface-container-lowest rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(24,28,32,0.08)] p-10 text-center">
        <h1 className="text-3xl font-headline font-extrabold text-on-surface mb-4">
          Admin accounts are created after approval
        </h1>
        <p className="text-on-surface-variant mb-6">
          Organization registrations are reviewed by a super admin. Once approved, your admin
          credentials are created automatically.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            className="px-6 py-3 rounded-xl bg-primary-container text-on-primary-container font-semibold"
            href="/register"
          >
            Register Organization
          </Link>
          <Link
            className="px-6 py-3 rounded-xl border border-outline-variant/40 text-on-surface font-semibold"
            href="/login"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    </main>
  );
}
