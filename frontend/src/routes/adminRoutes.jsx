import { Route, Routes } from "react-router-dom";

import AdminRoute from "./AdminRoute";

import AdminLayout from "../layouts/AdminLayout";

import DashboardScreen from "../screens/DashboardScreen";

import ExcelUploadScreen from "../screens/excelUpload/ExcelUploadScreen";

const AdminRoutes = ({ user }) => {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <AdminRoute user={user}>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<DashboardScreen />} />

        <Route path="excel-upload" element={<ExcelUploadScreen />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
