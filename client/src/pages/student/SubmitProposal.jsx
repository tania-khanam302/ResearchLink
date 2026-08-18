import { useState } from "react";
import { useDispatch } from "react-redux";
import { submitProjectProposal } from "../../store/slices/studentSlice";

const SubmitProposal = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      dispatch(submitProjectProposal(formData));
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="card shadow-lg rounded-md">
          <div className="card-header">
            <h1 className="card-title text-2xl font-bold text-slate-800 mb-2">
              Submit Proposal
            </h1>
            <p className="card-subtitle text-[#17a2b8]">
              Please fill out all sections of your thesis/project proposal. Make sure
              to be detailed and cleared about your thesis/project goals.{""}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Thesis/Project Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter your thesis/project title"
                className="
                  w-full
                  px-3
                  py-3
                  rounded-xl
                  border
                  border-slate-300
                  bg-slate-50
                  focus:bg-white
                  focus:border-[#17a2b8]
                  focus:ring-4
                  focus:ring-[#17a3b811]
                  outline-none
                  transition-all
                  duration-200
                "
                required
              />
            </div>

            <div>
              <label className="label">Thesis/Project Description</label>
              <textarea
                name="description"
                value={formData.Description}
                onChange={handleChange}
                placeholder="Provide a detailed description of your thesis/project..."
                className="
                  input
                  min-h-[120px]
                  w-full
                  px-3
                  py-3
                  rounded-xl
                  border
                  border-slate-300
                  bg-slate-50
                  focus:bg-white
                  focus:border-[#17a2b8]
                  focus:ring-4
                  focus:ring-[#17a3b811]
                  outline-none
                  transition-all
                  duration-200
                "
                required
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
              <button
                className="
                    bg-[#17a2b8]
                    hover:bg-[#138496]
                    text-white
                    px-6
                    py-2.5
                    rounded-md
                    font-medium
                    shadow-md
                    hover:shadow-lg
                    transition-all
                    duration-200
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    "
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Proposal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SubmitProposal;
