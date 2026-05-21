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
            <h1 className="card-title text-2xl font-bold text-slate-800 mb-2">Submit Proposal</h1>
            <p className="card-subtitle text-[#17a2b8]">
              Please fill out all sections of your project proposal. Make sure
              to be detailed and cleared about your project goals.{""}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Project Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input  placeholder-gray-400 focus:ring-1 focus:ring-[#17a2b8]"
                placeholder="Enter your project title"
                required
              />
            </div>

            <div>
              <label className="label">Project Description</label>
              <textarea
                name="description"
                value={formData.Description}
                onChange={handleChange}
                className="input placeholder-gray-400 focus:ring-1 focus:ring-[#17a2b8] min-h-[120px]"
                placeholder="Provide a detailed description of your project..."
                required
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
              <button
                className="btn-primary bg-[#17a2b8] hover:bg-[#138496] text-white px-4 font-medium h-10 rounded-md flex items-center space-x-2 mt-4 md:mt-0  disabled:opacity-50"
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
