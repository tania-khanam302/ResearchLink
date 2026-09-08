import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../../store/slices/notificationSlice";
import {
  AlertCircle,
  BadgeCheck,
  Bell,
  BellOff,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Clock5,
  MessageCircle,
  Settings,
  Trash2,
  User,
} from "lucide-react";



const NotificationsPage = () => {
  const dispatch = useDispatch();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 3;

  const notifications = useSelector((state) => state.notification.list);
  const unreadCount = useSelector((state) => state.notification.unreadCount);
  const totalPages = Math.ceil(notifications.length / notificationsPerPage);
  const startIndex = (currentPage - 1) * notificationsPerPage;
  const currentNotifications = notifications.slice(
    startIndex,
    startIndex + notificationsPerPage,
  );

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);
  useEffect(() => {
    setCurrentPage(1);
  }, [notifications.length]);

  const markAsReadHandler = (id) => {
    dispatch(markAsRead(id));
  };

  const markAllAsReadHandler = () => {
    dispatch(markAllAsRead());
  };

  const deleteNotificationHandler = (id) => {
    dispatch(deleteNotification(id));
  };

  // Notification Icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case "feedback":
        return <MessageCircle className="w-5 h-5 text-blue-600" />;

      case "deadline":
        return <Clock5 className="w-5 h-5 text-red-600" />;

      case "approval":
        return <BadgeCheck className="w-5 h-5 text-green-600" />;

      case "meeting":
        return <Calendar className="w-5 h-5 text-purple-600" />;

      case "system":
        return <Settings className="w-5 h-5 text-slate-600" />;

      default:
        return (
          <div className="relative w-5 h-5 flex items-center justify-center">
            <User className="w-4 h-4 absolute" />
            <ChevronDown className="w-3 h-3 absolute top-3" />
          </div>
        );
    }
  };

  // Notification Icon Background
  const getNotificationIconBg = (type) => {
    switch (type) {
      case "feedback":
        return "bg-blue-100";

      case "deadline":
        return "bg-red-100";

      case "approval":
        return "bg-green-100";

      case "meeting":
        return "bg-purple-100";

      case "system":
        return "bg-slate-100";

      default:
        return "bg-slate-100";
    }
  };

  // Priority Border
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-l-red-500";

      case "medium":
        return "border-l-4 border-l-yellow-500";

      case "low":
        return "border-l-4 border-l-green-500";

      default:
        return "border-l-4 border-l-slate-300";
    }
  };

  // Date Formatter
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();

    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    }

    if (diffDays === 1) {
      return "Yesterday";
    }

    if (diffDays <= 7) {
      return `${diffDays} days ago`;
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Notification Type Style
  const getTypeStyle = (type) => {
    switch (type) {
      case "feedback":
        return "bg-blue-100 text-blue-700";

      case "deadline":
        return "bg-red-100 text-red-700";

      case "approval":
        return "bg-green-100 text-green-700";

      case "meeting":
        return "bg-purple-100 text-purple-700";

      case "system":
        return "bg-slate-100 text-slate-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const stats = [
    {
      title: "Total",
      value: notifications.length,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
      titleColor: "text-blue-700",
      valueColor: "text-blue-900",
      Icon: Bell,
    },
    {
      title: "Unread",
      value: unreadCount,
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      textColor: "text-red-600",
      titleColor: "text-red-700",
      valueColor: "text-red-900",
      Icon: AlertCircle,
    },
    {
      title: "High Priority",
      value: notifications.filter((n) => n.priority === "high").length,
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      textColor: "text-yellow-600",
      titleColor: "text-yellow-700",
      valueColor: "text-yellow-900",
      Icon: Clock,
    },
    {
      title: "This Week",
      value: notifications.filter((n) => {
        const notifDate = new Date(n.createdAt);
        const weekAgo = new Date();

        weekAgo.setDate(weekAgo.getDate() - 7);

        return notifDate >= weekAgo;
      }).length,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-600",
      titleColor: "text-green-700",
      valueColor: "text-green-900",
      Icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden ">
        {/* Notifications Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#17a2b8] to-[#138496] px-6 sm:px-8 py-7">
          <div className="absolute -right-10 -top-12 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute right-20 -bottom-20 w-32 h-32 rounded-full bg-white/5" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                <Bell className="w-7 h-7 text-white" />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Notifications
                </h1>
                <p className="text-cyan-50 mt-1">
                  Stay updated with your thesis progress, project activities,
                  and important updates.
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsReadHandler}
                className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-[#138496] text-sm font-semibold hover:bg-cyan-50 transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />

                <span>Mark all as read</span>

                <span className="bg-[#138496] text-white px-2 py-0.5 rounded-full text-xs">
                  {unreadCount}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {stats.map((item, index) => {
              const Icon = item.Icon;

              return (
                <div
                  key={index}
                  className={`${item.bg} rounded-xl p-5 border border-white hover:shadow-sm transition-all duration-200`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-semibold ${item.titleColor}`}>
                        {item.title}
                      </p>

                      <p
                        className={`text-3xl font-bold mt-2 ${item.valueColor}`}
                      >
                        {item.value}
                      </p>
                    </div>

                    <div className={`p-3 ${item.iconBg} rounded-xl`}>
                      <Icon className={`w-6 h-6 ${item.textColor}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Notifications Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Recent Notifications
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Stay updated with your thesis progress, project activities, and
                important updates.
              </p>
            </div>
            {notifications.length > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-[#e8f7f9] text-[#138496] text-sm font-semibold">
                {notifications.length}{" "}
                {notifications.length === 1 ? "Notification" : "Notifications"}
              </span>
            )}
          </div>

          {/* notifications list */}
          <div className=" overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            {notifications.length > 0 ? (
              currentNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`
                    ${getPriorityColor(notification.priority)}
                    ${!notification.isRead ? "bg-blue-50/70" : "bg-white"}
                    border border-slate-200
                    rounded-xl
                    p-5
                    hover:shadow-md
                    transition-all duration-200
                  `}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`
                        flex-shrink-0
                        w-11 h-11
                        rounded-xl
                        flex items-center justify-center
                        ${getNotificationIconBg(notification.type)}
                      `}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title + Date */}
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`text-base font-bold ${
                              !notification.isRead
                                ? "text-slate-900"
                                : "text-slate-700"
                            }`}
                          >
                            {notification.title}
                          </h3>

                          {!notification.isRead && (
                            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(notification.createdAt)}</span>
                        </div>
                      </div>

                      {/* Message */}
                      <p className="text-slate-600 leading-6 mt-2 mb-4">
                        {notification.message}
                      </p>

                      {/* Footer */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`
                              inline-flex items-center
                              px-2.5 py-1
                              rounded-full
                              text-xs font-semibold
                              capitalize
                              ${getTypeStyle(notification.type)}
                            `}
                          >
                            {notification.type}
                          </span>

                          <span
                            className={`
                              inline-flex items-center
                              px-2.5 py-1
                              rounded-full
                              text-xs font-semibold
                              capitalize
                              ${
                                notification.priority === "high"
                                  ? "bg-red-100 text-red-700"
                                  : notification.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                              }
                            `}
                          >
                            {notification.priority} priority
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          {!notification.isRead && (
                            <button
                              onClick={() =>
                                markAsReadHandler(notification._id)
                              }
                              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              Mark as read
                            </button>
                          )}

                          <button
                            onClick={() =>
                              deleteNotificationHandler(notification._id)
                            }
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* Empty State */
              <div className="border border-dashed border-slate-300 rounded-2xl bg-slate-50/50 py-14 px-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-200 flex items-center justify-center">
                  <BellOff className="w-8 h-8 text-slate-400" />
                </div>

                <h3 className="text-lg font-semibold text-slate-700">
                  No Notifications Yet
                </h3>

                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                  You're all caught up. Thesis updates, project progress,
                  supervisor feedback, deadlines, and important announcements
                  will appear here.
                </p>
              </div>
            )}
          </div>
          {/* pagination  */}
          {totalPages > 1 && (
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-medium text-slate-700">
                    {startIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-slate-700">
                    {Math.min(
                      startIndex + notificationsPerPage,
                      notifications.length,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-slate-700">
                    {notifications.length}
                  </span>{" "}
                  notifications
                </p>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`
                            min-w-9 h-9 px-3
                            text-sm font-medium
                            rounded-lg border transition
                            ${
                              currentPage === page
                                ? "bg-[#17a2b8] text-white border-[#17a2b8]"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-[#f0fbfc] hover:text-[#138496]"
                            }
                          `}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
