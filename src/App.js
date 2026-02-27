//import "./App.css";
/*import "./assets/styles/global.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import AddTree from "./pages/AddTree";
import Login from "./pages/Admin/Login/Login";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import MasterSetting from "./pages/Master/MasterSetting";
import CountryView from "./pages/Master/CountryMaster/CountryView";
import StateView from "./pages/Master/StateMaster/StateView";
import ViewCity from "./pages/Master/CityMaster/ViewCity";
import ViewArea from "./pages/Master/AreaMaster/ViewArea";
import ViewTreename from "./pages/Master/TreenameMaster/ViewTreename";
import ViewUser from "./pages/Admin/ManageUser/ViewUser";
import UserDashboard from "./pages/User/UserDashboard";
import Register from "./pages/Admin/Login/Register";

function App() {
  const userType = localStorage.getItem("userType");
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trees" element={<AddTree />} />
          <Route path="/master" element={<MasterSetting />} />
          <Route path="/countries" element={<CountryView />} />
          <Route path="/states" element={<StateView />} />
          <Route path="/cities" element={<ViewCity />} />
          <Route path="/areas" element={<ViewArea />} />
          <Route path="/treename" element={<ViewTreename />} />
          <Route path="/manage-user" element={< ViewUser />} />
          <Route path="/register" element={<Register />} />


          <Route path="/" element={<Login />} />
          <Route
            path="/admin-dashboard"
            element={userType === "superAdmin" ? <AdminDashboard /> : <Login />}
          />
          <Route path="/user-dashboard" element={userType==="user"?<UserDashboard/>:<Login/>}/>
        </Routes>
      </MainLayout>
    </Router>
  );
}
export default App;*/

import "./assets/styles/global.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import Login from "./pages/Admin/Login/Login";
import Otp from "./pages/Admin/Login/otp";
import UserLogin from "./pages/User/UserLogin";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import ViewUser from "./pages/Admin/ManageUser/ViewUser";

import UserDashboard from "./pages/User/UserDashboard";

import AddTree from "./pages/Admin/manage-plantation/AddTree";
import MasterSetting from "./pages/Master/MasterSetting";
import CountryView from "./pages/Master/CountryMaster/CountryView";
import StateView from "./pages/Master/StateMaster/StateView";
import ViewCity from "./pages/Master/CityMaster/ViewCity";
import ViewArea from "./pages/Master/AreaMaster/ViewArea";
import ViewTreename from "./pages/Master/TreenameMaster/ViewTreename";
import ViewTreeList from "./pages/Admin/manage-plantation/ViewTreeList";
import ViewTreeDetail from "./pages/User/Manage-Tree/ViewTreeDetail";
import ViewTask from "./pages/User/Manage-Tree/ViewTask";
import TreeProfile from "./pages/User/Manage-Tree/TreeProfile";

import UserProfile from "./pages/Admin/ManageUser/UserProfile";
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  if (!token) return <Navigate to="/" />;

  if (role && role !== userType) return <Navigate to="/" />;

  return <MainLayout>{children}</MainLayout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> {/* Admin login */}
        <Route path="/otp" element={<Otp />} /> {/* OTP verification */}
        <Route path="/user-login" element={<UserLogin />} />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="superAdmin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-user"
          element={
            <ProtectedRoute role="superAdmin">
              <ViewUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        {/* ---------- SHARED ---------- */}
        <Route
          path="/trees"
          element={
            <ProtectedRoute>
              <AddTree />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tree-list"
          element={
            <ProtectedRoute>
              <ViewTreeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-task"
          element={
            <ProtectedRoute>
              <ViewTask />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tree-detail"
          element={
            <ProtectedRoute>
              <ViewTreeDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/master"
          element={
            <ProtectedRoute>
              <MasterSetting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/countries"
          element={
            <ProtectedRoute>
              <CountryView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/states"
          element={
            <ProtectedRoute>
              <StateView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cities"
          element={
            <ProtectedRoute>
              <ViewCity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/areas"
          element={
            <ProtectedRoute>
              <ViewArea />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-profile/:id"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tree-profile/:id"
          element={
            <ProtectedRoute>
              <TreeProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/treename"
          element={
            <ProtectedRoute>
              <ViewTreename />
            </ProtectedRoute>
          }
        />
        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
