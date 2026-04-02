'use client';

type NomineeToastProps = {
    href: string;
    label: string;
    title: string;
    description: string;
    cta: string;
};

export default function NomineeToast({ href, label, title, description, cta }: NomineeToastProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 ml-0 md:ml-auto inline-flex max-w-[320px] flex-col rounded-xl border border-cyan-300/20 bg-black/45 px-3 py-2 text-left backdrop-blur-sm transition-colors hover:border-cyan-200/55 hover:bg-black/65"
        >
            <span className="text-[9px] font-mono tracking-[0.18em] text-cyan-300">{label}</span>
            <span className="mt-1 text-[11px] font-medium text-gray-100">{title}</span>
            <span className="mt-1 text-[10px] font-mono leading-relaxed text-gray-400">{description}</span>
            <span className="mt-2 inline-flex w-fit items-center rounded-full border border-cyan-400/35 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-mono tracking-[0.12em] text-cyan-200">{cta}</span>
        </a>
    );
}
