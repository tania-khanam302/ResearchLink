import { LayoutDashboard } from "lucide-react";

const TeacherPageHeader = ({
  icon: Icon = LayoutDashboard,
  label,
  title = "Teacher",
  description,
  action,
}) => {
  return (
    <header className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-r from-[#f0fbfc] to-white px-3 py-3 shadow-sm xs:px-4 xs:py-4 sm:px-6 sm:py-5">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#17a2b8]/5 xs:-right-10 xs:-top-10 xs:h-24 xs:w-24 sm:-right-10 sm:-top-16 sm:h-36 sm:w-36" />

      <div className="pointer-events-none absolute -bottom-10 right-4 h-20 w-20 rounded-full bg-[#17a2b8]/5 xs:right-6 xs:-bottom-12 xs:h-24 xs:w-24 sm:right-20 sm:-bottom-20 sm:h-32 sm:w-32" />

      <div className="relative flex w-full min-w-0 flex-col gap-4 min-[421px]:flex-row min-[421px]:items-center min-[421px]:justify-between">

        {/* Left: Icon + Text */}
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#17a2b8]/20 bg-[#17a2b8]/10 xs:h-10 xs:w-10 sm:h-11 sm:w-11">
            <Icon className="h-4 w-4 text-[#138496] xs:h-5 xs:w-5" />
          </div>

          <div className="min-w-0 flex-1">
            {label && (
              <p className="text-xs font-medium leading-tight text-[#138496] sm:text-sm">
                {label}
              </p>
            )}

            <h1 className="mt-0.5 break-words text-lg font-semibold leading-tight tracking-tight text-slate-800 sm:text-2xl">
              {title}
            </h1>

            {description && (
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Action */}
        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}

      </div>
    </header>
  );
};

export default TeacherPageHeader;
