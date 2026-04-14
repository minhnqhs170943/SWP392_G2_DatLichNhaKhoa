import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import HomePage from './pages/Homepage';
import Product from './pages/Market/Product';
import ProductDetail from './pages/Market/ProductDetail';
import Cart from './pages/Market/Cart';
import StaffDashboard from './pages/Dashboard/StaffDashboard';
import StaffAppointments from './pages/Dashboard/StaffAppointments';
import StaffLayout from './layouts/StaffLayout';

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
        <Route path="/product-detail/:id" element={<ProductDetail />} />
        <Route path='/cart' element={<Cart />} />
        {/* Màn hình dành cho Staff với Layout */}
        <Route path='/staff-dashboard' element={<StaffLayout><StaffDashboard /></StaffLayout>} />
        <Route path='/staff-appointments' element={<StaffLayout><StaffAppointments /></StaffLayout>} />
      </Routes>
    </Router>
  );
}

export default App;