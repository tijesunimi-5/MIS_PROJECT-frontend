import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen gap-5">
      <h1 className="text-4xl font-bold">MIS SYSTEM</h1>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Register
        </Link>
      </div>
    </main>
  );
}
