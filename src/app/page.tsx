import { APP_DESCRIPTION, APP_DISPLAY_NAME } from "@/lib/app-info";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
        <p className="mb-4 text-sm font-medium text-cyan-700">
          Squelette technique
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
          {APP_DISPLAY_NAME}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
          {APP_DESCRIPTION}
        </p>
      </section>
    </main>
  );
}
