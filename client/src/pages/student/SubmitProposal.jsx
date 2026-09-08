import { useState } from "react";
import { useDispatch } from "react-redux";
import { submitProjectProposal } from "../../store/slices/studentSlice";
import { toast } from "react-toastify";
import { FolderOpen, GraduationCap, FileText, ArrowRight } from "lucide-react";

const SubmitProposal = () => {
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    researchArea: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      researchArea: type === "Thesis" ? prev.researchArea : "",
    }));
  };

  // handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.type) {
      toast.error("Please select Project or Thesis");
      return;
    }

    if (formData.type === "Thesis" && !formData.researchArea.trim()) {
      toast.error("Research area is required for Thesis");
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
      };

      if (formData.type === "Thesis") {
        payload.researchArea = formData.researchArea;
      }

      console.log("Sending payload:", payload);
      await dispatch(submitProjectProposal(payload)).unwrap();

      setFormData({
        type: "",
        title: "",
        description: "",
        researchArea: "",
      });
    } catch (error) {
      console.error("Proposal submission failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
        {/* Submit Proposal header  */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#17a2b8] to-[#138496] px-6 sm:px-8 py-7">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -right-4 -bottom-16 w-32 h-32 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Submit Proposal
              </h1>
              <p className="mt-1.5 text-sm sm:text-base text-white/80">
                Submit your thesis or project proposal for review.
              </p>
            </div>
          </div>
        </div>
        {/* from  */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 lg:p-10 space-y-8">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-800">
                Proposal Type
              </label>
              <p className="mt-1 text-sm text-slate-500">
                Choose the type of proposal you want to submit.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  value: "Project",
                  title: "Project",
                  description: "Submit a project proposal",
                  icon: FolderOpen,
                },
                {
                  value: "Thesis",
                  title: "Thesis",
                  description: "Submit a thesis proposal",
                  icon: GraduationCap,
                },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleTypeChange(item.value)}
                  className={`group relative text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                    formData.type === item.value
                      ? "border-[#17a2b8] bg-[#17a2b8]/5 shadow-md shadow-[#17a2b8]/10"
                      : "border-slate-200 bg-slate-50 hover:bg-white hover:border-[#17a2b8]/40 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        formData.type === item.value
                          ? "bg-[#17a2b8] text-white shadow-md"
                          : "bg-white border border-slate-200 group-hover:border-[#17a2b8]/30"
                      }`}
                    >
                      <item.icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800">
                        {item.title}
                      </h3>

                      <p className="mt-0.5 text-sm text-slate-500">
                        {item.description}
                      </p>
                    </div>

                    {/* Selected indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        formData.type === item.value
                          ? "border-[#17a2b8] bg-[#17a2b8]"
                          : "border-slate-300"
                      }`}
                    >
                      {formData.type === item.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              {formData.type === "Thesis"
                ? "Thesis Title"
                : formData.type === "Project"
                  ? "Project Title"
                  : "Thesis / Project Title"}
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={
                formData.type === "Thesis"
                  ? "Enter your thesis title"
                  : formData.type === "Project"
                    ? "Enter your project title"
                    : "Enter your thesis or project title"
              }
              maxLength={200}
              className="
                w-full px-4 py-3.5 rounded-xl
                border border-slate-200
                bg-slate-50 text-slate-800
                placeholder:text-slate-400
                outline-none transition-all duration-200
                hover:border-slate-300
                focus:bg-white
                focus:border-[#17a2b8]
                focus:ring-4 focus:ring-[#17a2b8]/10
              "
              required
            />
          </div>

          {/* ================= RESEARCH AREA ================= */}
          {/* research area  */}
          {formData.type === "Thesis" && (
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Research Area
              </label>
              <p className="mb-2 text-sm text-slate-500">
                Specify the main research area of your thesis.
              </p>

              <input
                type="text"
                name="researchArea"
                value={formData.researchArea}
                onChange={handleChange}
                placeholder="Specify the main research area of your thesis."
                maxLength={200}
                className="
                  w-full px-4 py-3.5 rounded-xl
                  border border-slate-200
                  bg-slate-50 text-slate-800
                  placeholder:text-slate-400
                  outline-none transition-all duration-200
                  hover:border-slate-300
                  focus:bg-white
                  focus:border-[#17a2b8]
                  focus:ring-4 focus:ring-[#17a2b8]/10
                "
                required
              />
            </div>
          )}

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-800">
                Description
              </label>

              <span className="text-xs text-slate-400">
                Detailed explanation
              </span>
            </div>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={
                formData.type === "Thesis"
                  ? "Provide a detailed description of your thesis..."
                  : formData.type === "Project"
                    ? "Provide a detailed description of your project..."
                    : "Provide a detailed description of your thesis or project..."
              }
              maxLength={2000}
              className="
                w-full min-h-[180px]
                px-4 py-3.5 rounded-xl
                border border-slate-200
                bg-slate-50 text-slate-800
                placeholder:text-slate-400
                outline-none transition-all duration-200
                resize-y
                hover:border-slate-300
                focus:bg-white
                focus:border-[#17a2b8]
                focus:ring-4 focus:ring-[#17a2b8]/10
              "
              required
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-slate-100">
            <div className="text-sm text-slate-500">
              <span className="text-[#17a2b8] font-medium">*</span> Please make
              sure all information is accurate.
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="
                inline-flex items-center justify-center gap-2
                bg-[#17a2b8]
                hover:bg-[#138496]
                active:bg-[#117a8b]
                text-white px-7 py-3 rounded-xl
                font-semibold
                shadow-md shadow-[#17a2b8]/20
                hover:shadow-lg hover:shadow-[#17a2b8]/25
                transition-all duration-200
                disabled:opacity-60
                disabled:cursor-not-allowed
                disabled:hover:shadow-md
              "
            >
              {isLoading ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Proposal
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitProposal;
