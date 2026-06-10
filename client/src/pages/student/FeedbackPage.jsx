import { MessageCircleMore } from "lucide-react";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const FeedbackPage = () => {
  return (
    <>
      <div className="space-y-6">
        <div className="card">
          {/*  header */}
          <div className="card-header">
            <h1 className="card-title text-2xl font-bold text-slate-800 mb-2">
              Supervisor Feedback
            </h1>
            <p className="card-subtitle text-[#17a2b8]">
              View feedback and comments from your Supervisor.
            </p>
          </div>

          {/* feedback stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-700">
                    Positive Feedback
                  </p>

                  <p className="text-sm font-medium text-green-900">120</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-700">
                    Neutral Feedback
                  </p>

                  <p className="text-sm font-medium text-yellow-900">45</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-700">
                    Negative Feedback
                  </p>

                  <p className="text-sm font-medium text-red-900">18</p>
                </div>
              </div>
            </div>
          </div>

          {/* feedback list demo */}
          <div className="space-y-6">
            <div className="text-center py-8">
              <MessageCircleMore className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No feedback received yet</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedbackPage;
