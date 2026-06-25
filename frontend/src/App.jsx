
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./client/pages/Home";
import About from "./client/pages/About";
import Produits from "./client/pages/Produits";
import Services from "./client/pages/Services";
import Contact from "./client/pages/Contact";
import Connexion from "./client/pages/Connexion";
import Inscription from "./client/pages/Inscription";
import DetailProduit from "./client/pages/DetailProduit";

import AdminDashboard from "./admin/Dashboard";
import AdminProducts from "./admin/Products";
import AdminCategories from "./admin/Categories";
import AdminQuoteRequests from "./admin/QuoteRequests";
import AdminOrders from "./admin/Orders";
import AdminCustomers from "./admin/Customers";
import AdminMessages from "./admin/Messages";
import AdminReports from "./admin/Reports";
import AccountValidations from "./admin/AccountValidations";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/produits" element={<Produits />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/produit/:id" element={<DetailProduit />}/>
        
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/produits" element={<AdminProducts />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/devis" element={<AdminQuoteRequests />} />
        <Route path="/admin/commandes" element={<AdminOrders />} />
        <Route path="/admin/clients" element={<AdminCustomers />} />
        <Route path="/admin/messages" element={<AdminMessages />} />
        <Route path="/admin/rapports" element={<AdminReports />} />
        <Route path="/admin/validations" element={<AccountValidations />} />

        {/* fallback route */}
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
