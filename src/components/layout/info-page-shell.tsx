import type { ReactNode } from "react";

type InfoPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function InfoPageShell({
  eyebrow,
  title,
  description,
  children,
}: InfoPageShellProps) {
  return (
    <div className="relative overflow-x-clip bg-[radial-gradient(70%_80%_at_25%_10%,#e9f8ff_0%,#cfefff_42%,#ffffff_80%)] text-slate-900">
      <section className="container mx-auto px-4 pb-16 pt-28 md:px-6 md:pb-20 md:pt-32">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full border border-[#000c26]/10 bg-white/80 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-[#000c26] shadow-sm">
            {eyebrow}
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#001b3c] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            {description}
          </p>
        </div>

        <div className="mt-10 rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-10">
          {children}
        </div>
      </section>
    </div>
  );
}
