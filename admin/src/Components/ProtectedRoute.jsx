import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {
  ADMIN_IDLE_TIMEOUT_MS,
  clearAdminSession,
  getLastAdminActivity,
  isAdminSessionActive,
  refreshAdminActivity,
} from '../utils/adminSession';

const ProtectedRoute = () => {
  const [isSessionActive, setIsSessionActive] = useState(() => isAdminSessionActive());

  useEffect(() => {
    if (!isSessionActive) return undefined;

    let timeoutId;
    let lastRefresh = 0;

    const logoutExpiredSession = () => {
      clearAdminSession();
      setIsSessionActive(false);
    };

    const scheduleLogout = () => {
      window.clearTimeout(timeoutId);

      const lastActivity = getLastAdminActivity();
      const remainingTime = lastActivity
        ? ADMIN_IDLE_TIMEOUT_MS - (Date.now() - lastActivity)
        : ADMIN_IDLE_TIMEOUT_MS;

      if (remainingTime <= 0) {
        logoutExpiredSession();
        return;
      }

      timeoutId = window.setTimeout(logoutExpiredSession, remainingTime);
    };

    const handleActivity = () => {
      if (!isAdminSessionActive()) {
        logoutExpiredSession();
        return;
      }

      const now = Date.now();
      if (now - lastRefresh >= 30000) {
        refreshAdminActivity(now);
        lastRefresh = now;
        scheduleLogout();
      }
    };

    const handleStorageChange = (event) => {
      if (event.key === "admin" && !event.newValue) {
        setIsSessionActive(false);
      }
    };

    scheduleLogout();

    const activityEvents = ["click", "keydown", "mousemove", "scroll", "touchstart"];
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isSessionActive]);

  return isSessionActive ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
