import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import AddTeacher from "../../components/modal/AddTeacher";
import { toast } from "react-toastify";
import { Plus, View } from "lucide-react";

const AdminDashboard = () => {
  return (
    <>
      <div className="space-y-6">
        {/* header */}
        <div className="bg-gradient-to-r from-[#17a2b8] to-purple-500 rounded-lg text-white p-4">
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-blue-100">
            Manage the entire project management system and oversee all
            activities.
          </p>
        </div>

        {/* stats cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {dashboardStats.map((item,i)=>{
            return(
              <div key={i} className="{`$item.bg` } rounded-lg p-4">
                <div className="flex items-center">
                  <div className={`p-2 ${item.iconBg} rounded-lg`}>
                    <item.Icon className="{`w-6 h-6 ${item.iconColor}`}"/>
                  </div>

                </div>
              </div>
            )
          })}
        </div> */}

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* vertical bar chart */}
          <div className="lg:col-span-2 card">
            <div className="card-header">
              <h3 className="card-title">Project Distribution by Supervisor</h3>
            </div>
            <div className="p-4">
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded text-slate-500">
                No Data
              </div>

              <ResponsiveContainer width={"100%"} height={"100%"}>
                <BarChart
                  margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  barCategoryGap={"20%"}
                ></BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ata extra design ar jonno dichi  */}
          <div className="lg:col-span-3 card">
            <div className="card-header">
              <h3 className="card-title">Recent Activity</h3>
            </div>
            <div className="p-4">
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded text-slate-500">
                No Recent Notification
              </div>

              <ResponsiveContainer width={"100%"} height={"100%"}>
                <BarChart
                  margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  barCategoryGap={"20%"}
                ></BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {/* <div className="card shadow-md">
  <div className="card-hrader">
    <h3 className="card-title">Recent Activity</h3>
     
  </div>

  <div className="space-y-3">
   
  </div>
</div> */}

        {/* Quick Actions */}
        <div className="card shadow-md">
          <div className="card-hrader">
            <h3 className="card-title">Quick Actions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 "></div>

          {/* extra  */}
          <div className="all-btn flex items-center text-center justify-between w-full mt-3 mb-5">
            <button className="btn-primary w-[300px] p-0 h-9 rounded-md flex items-center justify-center space-x-2 mt-4 md:mt-0">
              <Plus className="w-5 h-5" />
              <span>Add Student</span>
            </button>
            {/* <button className="btn-primary p-0 h-9 w-[300px]"><Plus className="w-5 h-5" />Add Student</button> */}
            <button className="btn-secondary w-[300px] p-0 h-9 rounded-md flex items-center justify-center space-x-2 mt-4 md:mt-0 shadow-md">
             
              <Plus className="w-5 h-5" /> <span>Add Teacher</span>
            </button>
            <button className="btn-outline w-[300px] p-0 h-9 rounded-md flex items-center justify-center space-x-2 mt-4 md:mt-0 shadow-md">
             
              <View className="w-5 h-5" /> <span>View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
