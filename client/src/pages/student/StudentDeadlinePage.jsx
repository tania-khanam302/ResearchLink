import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CalendarDays, CheckCircle2, Upload, X } from "lucide-react";
import { getStudentDeadlines, submitDeadline } from "../../store/slices/deadlineSlice";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const getStatus = (deadline) => {
  const status = deadline.submission?.status;
  if (status === "Submitted" || status === "Reviewed") return status;
  if (status === "Overdue") return "Overdue";
  return deadline.dueDate && new Date(deadline.dueDate) < new Date() ? "Overdue" : "Active";
};

const StudentDeadlinePage = () => {
  const dispatch = useDispatch();
  const { studentDeadlines = [], loading, submitting } = useSelector((state) => state.deadline);
  const [selected, setSelected] = useState(null);
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    dispatch(getStudentDeadlines());
  }, [dispatch]);

  const closeModal = () => {
    setSelected(null);
    setFile(null);
    setComment("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selected || (!file && !comment.trim())) return;
    const formData = new FormData();
    if (file) formData.append("files", file);
    if (comment.trim()) formData.append("studentComment", comment.trim());
    try {
      await dispatch(submitDeadline({ id: selected._id, formData })).unwrap();
      closeModal();
      dispatch(getStudentDeadlines());
    } catch {
      // The thunk displays the server error.
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-cyan-50 p-3 text-cyan-600"><CalendarDays className="h-6 w-6" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Deadlines</h1>
            <p className="mt-1 text-sm text-slate-500">Complete and submit the milestones assigned by your supervisor.</p>
          </div>
        </div>
      </header>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? <div className="p-8 text-center text-sm text-slate-500">Loading deadlines...</div> : studentDeadlines.length === 0 ? <div className="p-12 text-center text-sm text-slate-500">No deadlines assigned yet.</div> : (
          <div className="divide-y divide-slate-200">
            {studentDeadlines.map((deadline) => {
              const status = getStatus(deadline);
              const research = deadline.project || deadline.thesis;
              const unavailable = status === "Overdue" || status === "Submitted" || status === "Reviewed";
              return (
                <article key={deadline._id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">{deadline.type || "Deadline"}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === "Active" ? "bg-green-100 text-green-700" : status === "Overdue" ? "bg-red-100 text-red-700" : status === "Reviewed" ? "bg-cyan-100 text-cyan-700" : "bg-blue-100 text-blue-700"}`}>{status}</span>
                    </div>
                    <h2 className="mt-2 text-lg font-semibold text-slate-900">{deadline.name}</h2>
                    <p className="text-sm text-slate-500">{research?.title || "Project or thesis"}</p>
                    {deadline.description && <p className="mt-2 text-sm text-slate-600">{deadline.description}</p>}
                    <p className="mt-3 text-sm font-medium text-slate-700">Due {formatDate(deadline.dueDate)}</p>
                    {deadline.finalSubmitDate && <p className="text-sm font-medium text-indigo-600">Final submission by {formatDate(deadline.finalSubmitDate)}</p>}
                    {deadline.submission?.files?.length > 0 && (
                      <div className="mt-2 flex-wrap gap-2">
                        {deadline.submission.files.map((file) => (
                          <a key={file._id} href={file.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200">
                            <Upload className="h-3.5 w-3.5" />{file.originalName || "View file"}
                          </a>
                        ))}
                      </div>
                    )}
                    {deadline.submission?.studentComment && <p className="mt-2 text-sm italic text-slate-500">&ldquo;{deadline.submission.studentComment}&rdquo;</p>}
                    {deadline.submission?.teacherFeedback && (
                      <p className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800"><span className="font-semibold">Supervisor feedback: </span>{deadline.submission.teacherFeedback}</p>
                    )}
                  </div>
                  {unavailable ? <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">{status === "Submitted" || status === "Reviewed" ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : null}{status}</span> : <button type="button" onClick={() => setSelected(deadline)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-700"><Upload className="h-4 w-4" />Submit work</button>}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">Submit {selected.name}</h2><button type="button" onClick={closeModal} aria-label="Close" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
          <label className="mt-5 block text-sm font-medium text-slate-700">File</label>
          <input type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} className="mt-2 block w-full text-sm" />
          <label className="mt-5 block text-sm font-medium text-slate-700">Comment</label>
          <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-cyan-500" placeholder="Add a submission comment" />
          <button disabled={submitting || (!file && !comment.trim())} className="mt-5 w-full rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Submitting..." : "Submit work"}</button>
        </form>
      </div>}
    </div>
  );
};

export default StudentDeadlinePage;
