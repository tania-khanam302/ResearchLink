import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CheckCircle,
  Users,
  Clock,
  Loader2,
  MoveDiagonal,
  LayoutDashboard,
} from "lucide-react";
import { getTeacherDashboardStats } from "./../../store/slices/teacherSlice";

const TeacherDashboard = () => {
  const dispatch = useDispatch();

  const { dashboardStats, loading } = useSelector((state) => state.teacher);

  const { authuser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getTeacherDashboardStats());
  }, [dispatch]);

  const statsCards = [
    {
      title: "Assigned Students",
      value: dashboardStats?.assignedStudents || 0,
      loading,
      icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "Pending Requests",
      value: dashboardStats?.totalPendingRequests || 0,
      loading,
      icon: Clock,
      bg: "bg-yellow-100",
      color: "text-yellow-600",
    },
    {
      title: "Completed Thesis/Projects",
      value: dashboardStats?.completedProjects || 0,
      loading,
      icon: CheckCircle,
      bg: "bg-green-100",
      color: "text-green-600",
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* dashboard header */}
        <div className="relative px-6 py-5 border border-slate-200 rounded-xl bg-gradient-to-r from-[#f0fbfc] to-white overflow-hidden shadow-sm">
          <div className="absolute -right-10 -top-16 w-36 h-36 rounded-full bg-[#17a2b8]/5" />
          <div className="absolute right-20 -bottom-20 w-32 h-32 rounded-full bg-[#17a2b8]/5" />

          <div className="relative flex items-center gap-4">
            {/* Icon */}
            <div
              className="w-11 h-11 shrink-0 rounded-lg
                 bg-[#17a2b8]/10
                 border border-[#17a2b8]/20
                 flex items-center justify-center"
            >
              <LayoutDashboard className="w-5 h-5 text-[#138496]" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
                Teacher Dashboard
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your students and provide guidance on their thesis and projects
              </p>
            </div>
          </div>
        </div>

        {/* card stats  */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {statsCards.map(
            ({ title, value, loading, icon: Icon, bg, color }, index) => {
              return (
                <div key={index} className={`card`}>
                  <div className="flex items-center">
                    <div className={`p-3 ${bg} rounded-lg`}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>

                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">
                        {title}
                      </p>

                      <p className="text-sm font-medium text-slate-800">
                        {loading ? "..." : value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>

        {/* Recent Activity */}
        <div className=" bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Recent Activity Header */}
          <div className="relative px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-[#f0fbfc] to-white overflow-hidden">
            <div className="absolute -right-10 -top-16 w-36 h-36 rounded-full bg-[#17a2b8]/5" />
            <div className="absolute right-20 -bottom-20 w-32 h-32 rounded-full bg-[#17a2b8]/5" />

            <div className="relative flex items-center gap-4">
              <div
                className="w-11 h-11 shrink-0 rounded-lg
                   bg-[#17a2b8]/10
                   border border-[#17a2b8]/20
                   flex items-center justify-center"
              >
                <Clock className="w-5 h-5 text-[#138496]" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
                  Recent Activity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest notifications and updates
                </p>
              </div>
            </div>
          </div>

          {/* notifications */}
          <div className="p-6">
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={30} className="animate-spin text-[#17a2b8]" />
                </div>
              ) : dashboardStats?.recentNotifications?.length > 0 ? (
                dashboardStats.recentNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className="flex items-start gap-3 p-3
                       bg-slate-50 hover:bg-[#f0fbfc]
                       border border-slate-100
                       rounded-lg transition-colors"
                  >
                    <div
                      className="shrink-0 w-9 h-9 rounded-lg
                         bg-white border border-slate-200
                         flex items-center justify-center"
                    >
                      <MoveDiagonal className="w-4 h-4 text-[#138496]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700">
                        {notification.message}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(notification.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherDashboard;
