import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProject, getFeedback } from "../../store/slices/studentSlice";
import { AlertTriangle, BadgeCheck, MessageCircle, MessageCircleMore } from "lucide-react";

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
      return <BadgeCheck className="w-6 h-6 text-green-500" />;
    }
    if (type === "negative") {
      return <AlertTriangle className="w-6 h-6 text-red-500" />;
    }
    return <MessageCircle className="w-6 h-6 text-blue-500" />;
  };

  const feedbackStats = [
    {
      type: "general",
      title: "Total Feedback",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-800",
      valueColor: "text-blue-900",
      getCount: () => safeFeedback.length,
    },
    {
      type: "positive",
      title: "Positive",
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-800",
      valueColor: "text-green-900",
      getCount: () => safeFeedback.filter((f) => f.type === "positive").length,
    },
    {
      type: "negative",
      title: "Needs Revision",
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      textColor: "text-yellow-800",
      valueColor: "text-yellow-900",
      getCount: () => safeFeedback.filter((f) => f.type === "negative").length,
    },
  ];

  return (
    <>

    </>
  );
};

export default FeedbackPage;
