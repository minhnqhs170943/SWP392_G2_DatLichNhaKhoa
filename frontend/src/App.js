import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import HomePage from './pages/Homepage';
import Product from './pages/Market/Product';
import ProductDetail from './pages/Market/ProductDetail';
import Cart from './pages/Market/Cart'
import Doctor from './pages/Market/Doctor';
import CheckoutPage from './pages/CheckoutPage';
import DoctorDetail from './pages/Market/DoctorDetail';



function App() {
  return (
    <Router>
      <Routes>
        {/* Tự động chuyển hướng từ trang chủ sang trang login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Định nghĩa đường dẫn cho từng màn hình */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/product" element={<Product />} />
        <Route path="/doctor" element={<Doctor />} />
        <Route path="/doctor-detail/:id" element={<DoctorDetail />} />
        <Route path="/product-detail/:id" element={<ProductDetail />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/checkout' element={<CheckoutPage />} />
      </Routes>
    </Router>
  );
}

export default App;
