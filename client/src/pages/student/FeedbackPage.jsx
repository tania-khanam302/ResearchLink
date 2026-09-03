import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProject, getFeedback } from "../../store/slices/studentSlice";
import {
  AlertTriangle,
  BadgeCheck,
  MessageCircle,
  MessageCircleMore,
  CalendarDays,
  UserRound,
} from "lucide-react";

const FeedbackPage = () => {
  const dispatch = useDispatch();

  const { project, feedback } = useSelector((state) => state.student);
  const safeFeedback = Array.isArray(feedback) ? feedback : [];

  useEffect(() => {
    dispatch(fetchProject());
  }, [dispatch]);

  useEffect(() => {
    if (project?._id) {
      dispatch(getFeedback(project._id));
    }
  }, [dispatch, project?._id]);

  const getFeedbackIcon = (type) => {
    if (type === "positive") {
      return <BadgeCheck className="w-5 h-5 text-green-600" />;
    }

    if (type === "negative") {
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }

    return <MessageCircle className="w-5 h-5 text-[#138496]" />;
  };

  const getFeedbackStyle = (type) => {
    if (type === "positive") {
      return {
        iconBg: "bg-green-100",
        border: "border-green-200",
        badge: "bg-green-100 text-green-700",
        label: "Positive",
      };
    }

    if (type === "negative") {
      return {
        iconBg: "bg-red-100",
        border: "border-red-200",
        badge: "bg-red-100 text-red-700",
        label: "Needs Revision",
      };
    }

    return {
      iconBg: "bg-[#e8f7f9]",
      border: "border-slate-200",
      badge: "bg-slate-100 text-slate-700",
      label: "General",
    };
  };

  const feedbackStats = [
    {
      title: "Total Feedback",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      icon: <MessageCircle className="w-6 h-6 text-blue-600" />,
      textColor: "text-blue-700",
      valueColor: "text-blue-900",
      value: safeFeedback.length,
    },
    {
      title: "Positive",
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      icon: <BadgeCheck className="w-6 h-6 text-green-600" />,
      textColor: "text-green-700",
      valueColor: "text-green-900",
      value: safeFeedback.filter((f) => f.type === "positive").length,
    },
    {
      title: "Needs Revision",
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
      textColor: "text-yellow-700",
      valueColor: "text-yellow-900",
      value: safeFeedback.filter((f) => f.type === "negative").length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
        
         {/* header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#17a2b8] to-[#138496] px-6 sm:px-8 py-7">
          <div className="absolute -right-10 -top-12 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute right-20 -bottom-20 w-32 h-32 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
               Supervisor Feedback
               </h1>

              <p className="mt-1.5 text-sm sm:text-base text-white/80">
               Feedback provided by your supervisor
               </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {feedbackStats.map((item, index) => (
              <div
                key={index}
                className={`${item.bg} rounded-xl border border-white p-5 transition-all duration-200 hover:shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-semibold ${item.textColor}`}
                    >
                      {item.title}
                    </p>

                    <p
                      className={`text-3xl font-bold mt-2 ${item.valueColor}`}
                    >
                      {item.value}
                    </p>
                  </div>

                  <div className={`p-3 ${item.iconBg} rounded-xl`}>
                    {item.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section Title */}
          <div className="flex items-center justify-between mb-[40px]">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Feedback History
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Feedback provided by your supervisor
              </p>
            </div>

            {safeFeedback.length > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-[#e8f7f9] text-[#138496] text-sm font-semibold">
                {safeFeedback.length}{" "}
                {safeFeedback.length === 1 ? "Feedback" : "Feedbacks"}
              </span>
            )}
          </div>

          {/* Feedback List */}
         <div className=" overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
   {safeFeedback.length > 0 ? (
              safeFeedback.map((f, i) => {
                const style = getFeedbackStyle(f.type);

                return (
                  <div
                    key={i}
                    className={`border ${style.border} rounded-xl p-5 bg-white hover:shadow-md transition-all duration-200`}
                  >
                    {/* Feedback Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl ${style.iconBg} flex items-center justify-center`}
                        >
                          {getFeedbackIcon(f.type)}
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-800 text-lg capitalize">
                            {f.title || "Feedback"}
                          </h3>

                          <span
                            className={`inline-flex items-center mt-1 px-2.5 py-1 rounded-full text-xs font-semibold ${style.badge}`}
                          >
                            {style.label}
                          </span>
                        </div>
                      </div>

                      {/* Meta Information */}
                      <div className="flex flex-col md:items-end gap-1 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          <span>
                            {f.createdAt
                              ? new Date(
                                  f.createdAt
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Unknown date"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <UserRound className="w-4 h-4" />
                          <span>
                            {f.supervisorName || "Supervisor"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                      <p className="text-slate-700 leading-7 whitespace-pre-line">
                        {f.message || "No message provided."}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Empty State */
              <div className="border border-dashed border-slate-300 rounded-2xl py-12 px-6 text-center bg-slate-50/50">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <MessageCircleMore className="w-8 h-8 text-slate-400" />
                </div>

                <h3 className="text-lg font-semibold text-slate-700">
                  No Feedback Yet
                </h3>

                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                  You haven't received any feedback from your supervisor yet.
                  Feedback will appear here once it is provided.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
