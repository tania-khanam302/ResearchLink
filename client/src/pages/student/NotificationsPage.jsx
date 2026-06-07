import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const NotificationsPage = () => {
  return (
    <>
      <div className="space-y-6">
        <div className="card">
          {/* header  */}
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="card-title text-2xl font-bold text-slate-800 mb-2">
                  Notifications
                </h1>
                <p className="card-subtitle text-[#17a2b8]">
                  Stay updated with your project progress and deadlines
                </p>
              </div>

              <button className="btn-outline btn-small">
                Mark all as read
              </button>
            </div>
          </div>

          {/* No notifications yet */}
          <div className="text-center py-8">
            <p className="text-slate-500">No notifications yet</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
