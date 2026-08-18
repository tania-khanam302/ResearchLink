import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const TeacherFiles = () => {
  return <>
          <div className="space-y-6">
        {/* HEADER */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h1 className="card-title">Student Files</h1>
              <p className="card-subtitle">
                Manage files shared with and received from students
              </p>
            </div>
          </div>

          {/* CONTROLER */}
          <div className="flex flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <select
                className="input w-56"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Files</option>
                <option value="report">Reports</option>
                <option value="presentation">Presentation</option>
                <option value="code">Code</option>
                <option value="image">Image</option>
              </select>

              <input
                type="text"
                className="input w-96"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list"
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
      
      {/* FILE STATS */}
<div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
  {fileStats.map((item, i) => {
    return (
      <div key={i} className={`${item.bg} p-4 rounded-lg`}>
        <p className={`text-sm ${item.text}`}>{item.label}</p>
        <p className={`text-2xl ${item.text} font-bold`}>
          {item.count}
        </p>
      </div>
    );
  })}
</div>

      
      
      
      
        </div>

{/* FILES DISPLAY */}
{
  viewMode === "grid" ? (
    // <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    //   {filteredFiles.map((file) => (
    //     <div key={file.id} className="card">
    //       <div className="flex flex-col items-center text-center">
    //         <div className="mb-3">
    //           {getFileIcon(file.type)}
    //         </div>

    //         <h3
    //           className="font-medium text-slate-800 mb-1 truncate w-full"
    //           title={file.name}
    //         >
    //           {file.name}
    //         </h3>

    //         <p className="text-sm text-slate-600 mb-1">
    //           {file.student}
    //         </p>

    //         <p className="text-xs text-slate-500 mb-1">
    //           {file.size}
    //         </p>

    //         <p className="text-xs text-slate-500 mb-4">
    //           {new Date(file.uploadDate).toLocaleDateString()}
    //         </p>

    //         <div className="flex gap-2 w-full">
    //           <button
    //             onClick={() => handleDownloadFile(file)}
    //             className="rounded-lg text-white hover:bg-[#138496] bg-[#17a2b8] text-lg font-medium w-full flex items-center justify-center py-2 gap-3 transition-all duration-300"
    //           >
    //             <ArrowDownToLineIcon size={22} />
    //             Download
    //           </button>
    //         </div>
    //       </div>
    //     </div>
    //   ))}
    // </div>

<div className="card bg-gray-50 pe-4 pl-4  px-5 py-5">
      <div
  className="
    max-h-[650px]
    overflow-y-auto
    overflow-x-hidden
    pr-2
    [&::-webkit-scrollbar]:w-1.5
    [&::-webkit-scrollbar-track]:bg-slate-100
    [&::-webkit-scrollbar-thumb]:bg-[#17a2b8]
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb:hover]:bg-[#138496]
  "
>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    {filteredFiles.map((file) => (
      <div
        key={file.id}
        className="bg-white border border-slate-200 rounded-xl p-5 shadow-md hover:shadow-lg hover:border-[#17a2b8]/40 transition-all duration-300"
      >
        <div className="flex flex-col items-center text-center">
          
          {/* File Icon */}
          <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
            {getFileIcon(file.type)}
          </div>

          {/* File Name */}
          <h3
            className="font-semibold text-slate-800 mb-2 truncate w-full"
            title={file.name}
          >
            {file.name}
          </h3>

          {/* Student */}
          <p
            className="text-sm text-slate-600 truncate w-full mb-2"
            title={file.student}
          >
            {file.student}
          </p>

          {/* File Info */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-4">
            <span className="px-2 py-1 rounded-md bg-slate-100">
              {file.type}
            </span>

            {/* <span>•</span>
            <span>{file.size}</span> */}
          </div>

          {/* Upload Date */}
          <p className="text-xs text-slate-400 mb-5">
            {new Date(file.uploadDate).toLocaleDateString()}
          </p>

          {/* Download Button */}
          <div className="w-full">
            <button
              onClick={() => handleDownloadFile(file)}
              className="rounded-lg text-white hover:bg-[#138496] bg-[#17a2b8] text-sm font-medium w-full flex items-center justify-center py-2.5 gap-2 transition-all duration-300"
            >
              <ArrowDownToLineIcon size={20} />
              Download
            </button>
          </div>

        </div>
      </div>
    ))}
  </div>
</div>
</div>

  ) : (
    
 <div className="card p-4">
   <div className="max-h-[500px] overflow-auto">
    <table className="min-w-[900px] w-full border-collapse">
      
        <thead className="bg-slate-50 text-slate-700 sticky">
          <tr>
            {tableHeadData.map((t, i) => (
              <th
                key={i}
                
              className="sticky top-0 z-30 bg-white py-3 px-4 text-left font-semibold border-b border-slate-200 shadow-sm"
           
              >
                {t}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredFiles.map((file) => (
            <tr
              key={file.id}
              className="border-t hover:bg-slate-50 transition-colors"
            >
              {/* file name  */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <span className="font-medium">
                    {file.name}
                  </span>
                </div>
              </td>

              {/* student name  */}
              <td className="py-3 px-4">
                {file.student}
              </td>

              {/* file type  */}
              <td className="py-3 px-4">
                {file.type}
              </td>

              <td className="py-3 px-4">
                {new Date(file.uploadDate).toLocaleDateString()}
              </td>

              {/* <td className="py-3 px-4">
                {file.size}
              </td> */}

              <td className="py-3 px-4">
                <button
                  onClick={() => handleDownloadFile(file)}
                  className="btn-primary btn-small hover:bg-[#138496] bg-[#17a2b8]"
                >
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
 </div>
  )
}



      </div>
  
  </>
};

export default TeacherFiles;
