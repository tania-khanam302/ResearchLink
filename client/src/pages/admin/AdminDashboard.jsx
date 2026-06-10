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
      </div>
    </>
  );
};

export default AdminDashboard;
