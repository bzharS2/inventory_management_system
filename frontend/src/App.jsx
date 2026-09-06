// ...existing code...
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/products";
import Sales from "./pages/Sales";
import LowStocks from "./pages/LowStocks";
import Popular from "./pages/Popular";
import Cart from "./pages/cart"; // Import the Cart component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/lowStocks" element={<LowStocks />} />
        <Route path="/popular" element={<Popular />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
