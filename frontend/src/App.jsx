import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./client/components/Home";
import AdminDashboard from "./admin/Dashboard";
import AdminProducts from "./admin/Products";
import AdminCategories from "./admin/Categories";
import AdminQuoteRequests from "./admin/QuoteRequests";
import AdminOrders from "./admin/Orders";
import AdminCustomers from "./admin/Customers";
import AdminMessages from "./admin/Messages";
import AdminReports from "./admin/Reports";
import AccountValidations from "./admin/AccountValidations";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/produits" element={<AdminProducts />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/devis" element={<AdminQuoteRequests />} />
        <Route path="/admin/commandes" element={<AdminOrders />} />
        <Route path="/admin/clients" element={<AdminCustomers />} />
        <Route path="/admin/messages" element={<AdminMessages />} />
        <Route path="/admin/rapports" element={<AdminReports />} />
        <Route path="/admin/validations" element={<AccountValidations />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}