import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomeFour from './HomeFour';
import Destinations from "./Destinations";
import AboutOne from '../Components/About/AboutOne';
import ExpoDetails from '../Components/Guide/ExpoDetails';
import RegistrationForm from './RegistrationForm';
import ForVisitors from './ForVisitors';
import ThankYou from "./ThankYou";
import LoadTop from '../Components/LoadTop'

function RouterPage() {
  return (
    <div>
      <Router>
        <LoadTop />
        <Routes>
          <Route path="/" element={<HomeFour />}></Route>
          <Route path="/hero" element={<HomeFour />}></Route>
          <Route path="/destinations" element={<Destinations />}></Route>
          <Route path="/aboutus" element={<AboutOne />}></Route>
          <Route path="/expodetails" element={<ExpoDetails />}></Route>
          <Route path="/registrationForm" element={<RegistrationForm />}></Route>
          <Route path="/forvisitors" element={<ForVisitors />}></Route>
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </Router>
    </div>
  )
}

export default RouterPage