import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const NotificationsPage = () => {
  return <>
  
  <div className="space-y-6">
    </div>
    <div className="card">
   {/* Card Header */}
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
     
            </div>
          </div>


        {/* Notification Stats */}
         <div className="gird gird-cols-1 md:gird-cols-4
        gap-4 mb-6">

        </div>

    </div>
    
    
    </>;
};

export default NotificationsPage;
