import Link from "next/link";
import { LongArrowLeftIcon } from "@/icons";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  backHref: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  backHref,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-2">
        <Link
          href={backHref}
          className="text-light-primary-text hover:bg-gray-200 size-8 rounded-full flex items-center justify-center transition-colors"
        >
          <LongArrowLeftIcon className="w-6 h-6" />
        </Link>
        <h2 className="text-lg sm:text-xl font-bold text-light-primary-text">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
