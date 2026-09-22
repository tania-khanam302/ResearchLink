import { LayoutDashboard } from "lucide-react";

const TeacherPageHeader = ({
  icon: Icon = LayoutDashboard,
  label,
  title = "Teacher",
  description,
  action,
  subHeader = false,
}) => {
  return (
    <header
      className={
        subHeader
          ? "relative w-full overflow-hidden border-b border-slate-200 bg-gradient-to-r from-[#f0fbfc] to-white px-3 py-3 xs:px-4 xs:py-4 sm:px-6 sm:py-5"
          : "relative w-full overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-r from-[#f0fbfc] to-white px-3 py-3 shadow-sm xs:px-4 xs:py-4 sm:px-6 sm:py-5"
      }
    >
      {/* Decorative circles */}
      <div
        className={
          subHeader
            ? "pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-[#17a2b8]/5 xs:-right-10 xs:-top-12 xs:h-28 xs:w-28 sm:h-36 sm:w-36"
            : "pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#17a2b8]/5 xs:-right-10 xs:-top-10 xs:h-24 xs:w-24 sm:-right-10 sm:-top-16 sm:h-36 sm:w-36"
        }
      />

      {!subHeader && (
        <div className="pointer-events-none absolute -bottom-10 right-4 h-20 w-20 rounded-full bg-[#17a2b8]/5 xs:right-6 xs:-bottom-12 xs:h-24 xs:w-24 sm:right-20 sm:-bottom-20 sm:h-32 sm:w-32" />
      )}

      <div className="relative flex w-full min-w-0 flex-col gap-3 min-[421px]:flex-row min-[421px]:items-center min-[421px]:justify-between sm:gap-4">

        {/* Left: Icon + Text */}
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">

          {/* Icon */}
          <div
            className={
              subHeader
                ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#17a2b8]/20 bg-[#17a2b8]/10 xs:h-10 xs:w-10 sm:h-11 sm:w-11"
                : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#17a2b8]/20 bg-[#17a2b8]/10 xs:h-10 xs:w-10 sm:h-11 sm:w-11"
            }
          >
            <Icon className="h-4 w-4 text-[#138496] xs:h-5 xs:w-5" />
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">

            {/* Label - Main Header only */}
            {label && (
              <p className="text-xs font-medium leading-tight text-[#138496] sm:text-sm">
                {label}
              </p>
            )}

            {/* Title */}
            <h1
              className={
                subHeader
                  ? "mt-0.5 break-words text-base font-semibold leading-5 tracking-tight text-slate-800 xs:text-lg xs:leading-6 sm:text-xl sm:leading-7"
                  : "mt-0.5 break-words text-lg font-semibold leading-tight tracking-tight text-slate-800 sm:text-2xl"
              }
            >
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p
                className={
                  subHeader
                    ? "mt-0.5 break-words text-[10px] leading-4 text-slate-500 xs:mt-1 xs:text-xs sm:text-sm"
                    : "mt-1 break-words text-xs leading-5 text-slate-500 sm:text-sm"
                }
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Action */}
        {action && (
          <div className="shrink-0 min-[421px]:ml-auto">
            {action}
          </div>
        )}
      </div>
    </header>
  );
};

export default TeacherPageHeader;