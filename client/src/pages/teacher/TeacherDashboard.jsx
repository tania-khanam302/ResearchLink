
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle, Users, Clock, Loader, Loader2, MoveDiagonal } from "lucide-react";
import { getTeacherDashboardStats } from './../../store/slices/teacherSlice';
// import { title } from 'process';

const TeacherDashboard = () => {
  const dispatch = useDispatch();

  const { dashboardStats, loading } = useSelector(
    (state) => state.teacher
  );

  const { authuser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getTeacherDashboardStats());
  }, [dispatch]);

  const statsCards = [
    {
      // title: "Assigned Students",
      // value: authuser?.assignedStudents?.length || 0,
      // loading,
      // icon: Users,
      // bg: "bg-blue-100",
      // color: "text-blue-600",
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
      title: "Completed Projects",
      value: dashboardStats?.completedProjects || 0, 
      loading,
      icon: CheckCircle,
      bg: "bg-green-100",
      color: "text-green-600",
    },
  ];

  return (
    <>
    <div  className="space-y-6">
        {/*header */}
      <div className="bg-gradient-to-r from-[#17a2b8] to-green-500 rounded-lg text-white p-4">
        <h1 className="text-2xl font-bold mb-2">Teacher Dashboard</h1>
        <p className="text-green-100">
          Manage your student and provide guidance on their projects.
        </p>
      </div>

      {/* card stats  */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
        {
          statsCards.map(
            ({ title, value, loading, icon: Icon, bg, color },index) => {
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
            }
          )
        }

        </div>
        
           {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Activity</h2>
          <p className="card-subtitle">
            Latest notifications and updates
          </p>
        </div>

        <div className="space-y-4">
          {/* Recent activity content goes here */}
          {loading ? (
              <Loader2 size={32} className="animate-spin"/>
            ): dashboardStats?.recentNotifications?.length> 0 ?(
              dashboardStats.recentNotifications.map((notification)=>{
                return(
                  <div key={notification._id}
                  className="flex items-center p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="p-2 bg-white rounded-lg to-slate-600">
                      <MoveDiagonal className="w-5 h-5"/>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-slate-800">{notification.message}</p>
                      <p className="text-sm text-slate-800">{new Date(notification.createdAt).toDateString()}</p>

                    </div>

                  </div>
                )
              })
            ):(
              <div className="text-center py-4 to-slate-500">
                No recent activity
              </div>
            )
          }
        </div>
      </div>
     </div>





      {/* header */}
      {/* <div className="bg-gradient-to-r from-[#17a2b8] to-green-500 rounded-lg text-white p-4">
        <h1 className="text-2xl font-bold mb-2">Teacher Dashboard</h1>
        <p className="text-green-100">
          Manage your student and provide guidance on their projects.
        </p>
      </div>
      
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">

{
  statsCards.map(
    ({ title, value, loading, icon: Icon, bg, color },index) => {
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
    }
  )
}

        </div> */}
      

   
        









    </>
  );
};

export default TeacherDashboard;
