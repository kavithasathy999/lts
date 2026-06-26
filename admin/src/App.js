import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import AdminRegister from "./Pages//AdminRegister";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./Pages/AdminDashboard";
import AdminLayout from "./Layout/AdminLayout";
import RegistrationList from "./Pages/RegistrationList";
import RegistrationDetails from "./Pages/RegistrationDetails";
import ExhibitorDetails from "./Pages/ExhibitorDetails";
import StallsList from "./Pages/StallsList";
import BannerAdmin from "./Pages/BannerAdmin";
// import VideoUpload from './Pages/VideoUpload';
import SponsorsUpload from "./Pages/SponsorsUpload";
import MapUpload from './Pages/MapUpload';
import AdminManageStalls from "./Pages/AdminManageStalls";
import DestinationsTextAdmin from "./Pages/DestinationsTextAdmin";
import VisitorRegistrations from "./Pages/VisitorRegistrations";
import VisitorEventDetails from "./Pages/VisitorEventDetails";
import ExhibitorEventDetails from "./Pages/ExhibitorEventDetails";
import VisitorDetails from "./Pages/VisitorDetails";
import VisitorList from "./Pages/VisitorsList";
import VisitedPersonDetails from "./Pages/VisitedPersonDetails";
import StallPricing from "./Pages/StallPricing";
import VoucherAdmin from "./Pages/VoucherAdmin";

function App() {
  return (
    <Router>
      <ToastContainer position="top-center" autoClose={2000} />
      <Routes>
        {/* Login */}
        <Route path="/" element={<AdminLogin />} />

        {/* Register */}
        <Route path="/admin-register" element={<AdminRegister />} />

        {/* Admin Layout + Nested Pages */}
        <Route path="/admin" element={<AdminLayout />}>

          {/* Dashboard */}
          <Route index element={<AdminDashboard />} />

          {/* Pages */}
          <Route path="registrations" element={<RegistrationList />} />
          <Route path="/admin/registration-details" element={<RegistrationDetails />} />
          <Route path="stalls-old" element={<StallsList />} />
          <Route path="banner" element={<BannerAdmin />} />
          {/* <Route path="upload-video" element={<VideoUpload />} /> */}
          <Route path="/admin/sponsors" element={<SponsorsUpload />} />
          <Route path="map" element={<MapUpload />} />
          <Route path="/admin/stalls" element={<AdminManageStalls />} />
          <Route path="/admin/edit-destination-text" element={<DestinationsTextAdmin />} />
          <Route path="/admin/visitor-registrations" element={<VisitorRegistrations />} />
          <Route path="/admin/visitor-event-settings" element={<VisitorEventDetails />} />
          <Route path="/admin/exhibitor-event-settings" element={<ExhibitorEventDetails />} />
          <Route path="/admin/exhibitor-details" element={<ExhibitorDetails />} />
          <Route path="/admin/visitor-details" element={<VisitorDetails />} />
          <Route path="/admin/visitors" element={<VisitorList />} />
          <Route path="/admin/visitor/:id" element={<VisitedPersonDetails />} />
          <Route path="/admin/stall-pricing" element={<StallPricing />} />
          <Route path="/admin/upload-voucher" element={<VoucherAdmin />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
