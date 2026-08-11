import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllSupervisor,
  fetchProject,
  getSupervisor,
  requestSupervisor,
} from "../../store/slices/studentSlice";

import { UserPlus, X } from "lucide-react";

const SupervisorPage = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);

  const {
    project,
    supervisors = [],
    supervisor,
  } = useSelector((state) => state.student);

  const safeSupervisors = Array.isArray(supervisors) ? supervisors : [];

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [requestedSupervisorId, setRequestedSupervisorId] = useState(null);

  useEffect(() => {
    dispatch(fetchProject());
    dispatch(getSupervisor());
    dispatch(fetchAllSupervisor());
  }, [dispatch]);

  const hasSupervisor = useMemo(
    () => !!(supervisor && supervisor._id),
    [supervisor],
  );

  const hasProject = useMemo(() => !!(project && project._id), [project]);

  const formatDeadline = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    const day = date.getDate();
    const j = day % 10,
      k = day % 100;
    const suffix =
      j === 1 && k !== 11
        ? "st"
        : j === 2 && k !== 12
          ? "nd"
          : j === 3 && k !== 13
            ? "rd"
            : "th";
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${suffix} ${month} ${year}`;
  };

  const handleOpenRequest = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setShowRequestModal(true);
  };

const submitRequest = async () => {
  if (!selectedSupervisor) return;

  const message =
    requestMessage?.trim() ||
    `${authUser.name || "Student"} has requested ${
      selectedSupervisor.name
    } to be their supervisor.`;

  const res = await dispatch(
    requestSupervisor({
      teacherId: selectedSupervisor._id,
      message,
    })
  );

  if (requestSupervisor.fulfilled.match(res)) {
    // supervisor request pending
    setRequestedSupervisorId(selectedSupervisor._id);

    // modal close
    setShowRequestModal(false);
    setSelectedSupervisor(null);
    setRequestMessage("");
  }
};

  
  return (
    <>

    </>
  );
};

export default SupervisorPage;
