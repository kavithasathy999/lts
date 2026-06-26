// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { toast, ToastContainer } from 'react-toastify';  

// function VideoUpload() {
//   const [file, setFile] = useState(null);            
//   const [videoUrl, setVideoUrl] = useState('');      
//   const [uploadedFileName, setUploadedFileName] = useState(''); 
//   const fileInputRef = useRef(null);

//   const fetchVideo = async () => {
//     try {
//       const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/video`);
//       setVideoUrl(res.data.videoUrl || '');
//       if (res.data.videoUrl) {
//         const parts = res.data.videoUrl.split('/');
//         setUploadedFileName(parts[parts.length - 1]);
//       } else {
//         setUploadedFileName('');
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     fetchVideo();
//   }, []);

//   const handleUpload = async () => {
//     if (!file) {
//       toast.error("Please select a video file first!");
//       return;
//     }

//     const formData = new FormData();
//     formData.append('video', file);

//     const toastId = toast.loading("Uploading video... please wait.");

//     try {
//       await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/video`, formData);
      
//       toast.update(toastId, { 
//         render: "Video uploaded successfully!", 
//         type: "success", 
//         isLoading: false, 
//         autoClose: 1500 
//       });

//       setFile(null);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//       fetchVideo();
//     } catch (err) {
//       toast.update(toastId, { 
//         render: "Upload failed. Please try again.", 
//         type: "error", 
//         isLoading: false, 
//         autoClose: 1500 
//       });
//     }
//   };

//   const handleDelete = async () => {
//     try {
//       await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/video`);
//       toast.error("Video removed successfully!");
//       setVideoUrl('');
//       setUploadedFileName('');
//     } catch (err) {
//       toast.error("Failed to delete the video.");
//     }
//   };

//   return (
//     <div className="video-upload-wrapper" style={{ 
//       fontFamily: "'Montserrat', sans-serif",
//       backgroundColor: "#fbfaff",
//       minHeight: "100vh",
//       width: "100%",
//       overflowX: "hidden",
//       padding: "40px",
//       boxSizing: "border-box"
//     }}>
//       {/* CRITICAL: This must be present for toasts to show up */}
//       <ToastContainer position="top-right" autoClose={1500} hideProgressBar={false} />

//       <style>{`
//         .video-page-header {
//           padding-left: 20px;
//           margin-bottom: 40px;
//         }
//         .upload-card {
//           border: none !important;
//           border-radius: 20px;
//           background: #fff;
//           box-shadow: 0 4px 15px rgba(0,0,0,0.04);
//           max-width: 800px;
//         }
//         .file-select-area {
//           border: 2px dashed #e0e0e0;
//           border-radius: 15px;
//           padding: 30px;
//           text-align: center;
//           background: #faf9ff;
//         }
//         .preview-container {
//           background: #000;
//           border-radius: 15px;
//           padding: 10px;
//           margin-top: 25px;
//         }
//       `}</style>

//       <div className="video-page-header">
//         <h2 className="fw-bold m-0" style={{ color: "#2d3436" }}>Upload Video</h2>
//       </div>

//       <div className="card upload-card p-4">
//         <input
//           type="file"
//           accept="video/*"
//           ref={fileInputRef}
//           style={{ display: "none" }}
//           onChange={(e) => {
//             const selectedFile = e.target.files[0];
//             setFile(selectedFile);
//           }}
//         />

//         <div className="file-select-area mb-4">
//           <i className="fas fa-video mb-3" style={{ fontSize: "2.5rem", color: "#593983" }}></i>
//           <h5 className="fw-bold">Select Video File</h5>
          
//           <div className="d-flex flex-column align-items-center gap-3 mt-3">
//             <button
//               className="btn px-4 py-2 fw-bold"
//               style={{ 
//                 border: "2px solid #593983", 
//                 color: "#593983",
//                 borderRadius: "10px",
//                 background: "transparent"
//               }}
//               onClick={() => fileInputRef.current.click()}
//             >
//               <i className="fas fa-folder-open me-2"></i>Browse Files
//             </button>

//             <span className="fw-bold px-3 py-1 rounded-pill" style={{ 
//               fontSize: "13px", 
//               backgroundColor: file || uploadedFileName ? "#eee" : "transparent",
//               color: "#593983"
//             }}>
//               {file ? file.name : uploadedFileName || "No file selected"}
//             </span>
//             <p className="small text-muted mb-0">A file size below 5 MB is preferred</p>
//           </div>
//         </div>

//         <button 
//           className="btn w-100 py-3 fw-bold shadow-sm"
//           onClick={handleUpload} 
//           disabled={!file}
//           style={{ 
//             backgroundColor: file ? "#593983" : "#ccc", 
//             border: "none",
//             color: "#fff",
//             borderRadius: "12px"
//           }}
//         >
//           <i className="fas fa-cloud-upload-alt me-2"></i>Start Upload
//         </button>
        
//         {uploadedFileName && (
//           <div className="mt-5 border-top pt-4">
//             <div className="d-flex justify-content-between align-items-center mb-3">
//               <h6 className="fw-bold m-0 text-muted">Active Promotional Video</h6>
//               <button
//                 className="btn btn-danger btn-sm fw-bold px-3"
//                 onClick={handleDelete}
//                 style={{ borderRadius: "8px" }}
//               >
//                 <i className="fas fa-trash-alt me-2"></i>Remove Video
//               </button>
//             </div>
            
//             {videoUrl && (
//               <div className="preview-container shadow">
//                 <video
//                   src={videoUrl}
//                   controls
//                   className="w-100 rounded"
//                   style={{ maxHeight: "400px" }}
//                 />
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default VideoUpload;