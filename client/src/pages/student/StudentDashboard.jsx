import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const StudentDashboard = () => {
  return (
    <>
      <div className="space-y-6">
        {/* header */}
        <div className="bg-gradient-to-r from-[#17a2b8] to-purple-500 rounded-lg text-white p-4">
          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-blue-100">
            Here's your project overview and recent updates.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 mb:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">📘</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Project Title
                </p>
                <p className="text-lg mt-2 font-medium text-slate-600">
                  E-commerce
                </p>
                {/* <p className="text-lg font-semibold text-slate-800">
                      {project?.title || "No Project"}
                      </p> */}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">👨‍🏫 </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Supervisor</p>
                <p className="text-[18px] mt-2  font-medium text-slate-600">Md. Rahim</p>
                {/* <p className="text-lg font-semibold text-slate-800">
                      {supervisorName || "N/A"}
                      </p> */}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">⏰ </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Next Deadline
                </p>
                <p className="text-[18px] mt-2  font-medium text-slate-600">N/A</p>
                {/* <p className="text-lg font-semibold text-slate-800">
                      {formatDate(project?.deadline)}
                    </p> */}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">💬</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Recent Feedback
                </p>
                <p className="text-[18px] mt-2 font-medium text-slate-600">
                  No feedback yet
                </p>
                {/* <p className="text-lg font-semibold text-slate-800">
                     {
                        feedbackList?.length 
                        ? formatDate(feedbackList[0]?.createAt)
                        : ""
                     }
                    </p> */}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID*/}
        <div
          className="grid grid-cols-1 lg:grid-cols-2
     gap-6"
        >
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Project Overview</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Title
                </label>
                {/* <p className="text-slate-800 font-medium">
                      {project?.title || "N/A"}</p> */}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Description
                </label>
                {/* <p className="text-slate-800 font-medium">
                      {project?.description || "No description provided"}
                      </p> */}
              </div>

              <div className="flex items-center gap-2">
                <label classname="text-sm font-medium text-slate-600">
                  Status
                </label>
                {/* <span classname={`inline-flex items-center px-2 py-[2px] rounded-full text-sm
                     font-medium capitalize ${project?.status ===
                     "approved" ? "bg-green-100 text-green-800"
                     : project?.status === "pending" 
                     ?"bg-yellow-100 text-yellow-800" : 
                     project?.status === "rejected"
                     ? "bg-red-100 text-red-800" 
                     : "bg-gray-100 text-gray-800"
                    }`}
                     >
                        {project?.status || "Unknown"}
                     </span> */}
              </div>

              <div>
                <label
                  className="text-sm font-medium 
                  text-slate-600"
                >
                  Submission Deadline
                </label>
                {/* <p className="text-slate-800 font-medium">{formatDate
                  (project?.deadline)}</p> */}
              </div>
            </div>
          </div>

          <div className="card">
            <div
              className="card-header flex
                 items-center justify-between"
            >
              <h2 classname="card-title">Latest Feedback</h2>
              {/* <Link to={"/student/feedback"}
                     classname="text-sm bg-blue-500 text-white
                     px-3 py-1 rounded-full font-medium
                     hover:bg-blue-600 transition-all duration-300"
                    >
                      View All
                    </Link> */}
            </div>
          </div>
        </div>

        {/* UPCOMING DEADLINE & NOTIFICATION */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2
             gap-6"
        >
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Upcoming Deadlines</h2>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Notifications</h2>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
