import Link from "next/link";

export default function AdminNavbar() {
  return (
    <div className="w-full bg-pink-600 shadow-lg mb-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-10 py-5">

        {/* Title */}
        <Link
          href="/admin"
          className="text-2xl font-bold text-white tracking-wide"
        >
          Admin Dashboard 🎀
        </Link>

        {/* Navigation */}
        <div className="flex gap-8 text-white text-lg font-medium">

          <Link
            href="/admin/users"
            className="hover:underline hover:opacity-90"
          >
            Users
          </Link>

          <Link
            href="/admin/images"
            className="hover:underline hover:opacity-90"
          >
            Images
          </Link>

          <Link
            href="/admin/captions"
            className="hover:underline hover:opacity-90"
          >
            Captions
          </Link>

        </div>
      </div>
    </div>
  );
}