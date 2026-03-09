import Link from "next/link";

export default function AdminNavbar() {
  return (
    <div className="w-full bg-pink-600 shadow-lg mb-10 rounded-2xl">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center px-10 py-5 gap-4">
        <Link
          href="/admin"
          className="text-2xl font-bold text-white tracking-wide"
        >
          Admin Dashboard 🎀
        </Link>

        <div className="flex flex-wrap gap-6 text-white text-sm font-medium">
          <Link href="/admin/users" className="hover:underline">
            Users
          </Link>

          <Link href="/admin/images" className="hover:underline">
            Images
          </Link>

          <Link href="/admin/captions" className="hover:underline">
            Captions
          </Link>

          <Link href="/admin/humor-flavors" className="hover:underline">
            Humor Flavors
          </Link>

          <Link href="/admin/humor-flavor-steps" className="hover:underline">
            Flavor Steps
          </Link>

          <Link href="/admin/humor-mix" className="hover:underline">
            Humor Mix
          </Link>

          <Link href="/admin/terms" className="hover:underline">
            Terms
          </Link>

          <Link href="/admin/caption-requests" className="hover:underline">
            Caption Requests
          </Link>

          <Link href="/admin/caption-examples" className="hover:underline">
            Caption Examples
          </Link>

          <Link href="/admin/llm-models" className="hover:underline">
            LLM Models
          </Link>

          <Link href="/admin/llm-providers" className="hover:underline">
            LLM Providers
          </Link>

          <Link href="/admin/llm-prompt-chains" className="hover:underline">
            Prompt Chains
          </Link>

          <Link href="/admin/llm-responses" className="hover:underline">
            LLM Responses
          </Link>

          <Link href="/admin/allowed-signup-domains" className="hover:underline">
            Signup Domains
          </Link>

          <Link href="/admin/whitelisted-emails" className="hover:underline">
            Whitelisted Emails
          </Link>
        </div>
      </div>
    </div>
  );
}