import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import RoleRoute from './components/RoleRoute';
import AdminProduct from './pages/Admin/AdminProduct';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Login from './pages/Auth/Login';
import Profile from './pages/Auth/Profile';
import Register from './pages/Auth/Register';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/Homepage';
import Cart from './pages/Market/Cart';
import Doctor from './pages/Market/Doctor';
import DoctorDetail from './pages/Market/DoctorDetail';
import Product from './pages/Market/Product';
import ProductDetail from './pages/Market/ProductDetail';
import Review from './pages/Market/Review';
import NotificationsPage from './pages/NotificationsPage';
import OrdersPage from './pages/OrdersPage';
import PaymentCancel from './pages/PaymentCancel';
import PaymentQRPage from './pages/PaymentQRPage';
import PaymentSuccess from './pages/PaymentSuccess';

// RoleID từ DB: 1-Admin, 2-Staff, 3-Doctor, 4-User
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/product" element={<Product />} />
        <Route path="/doctor" element={<Doctor />} />
        <Route path="/doctor-detail/:id" element={<DoctorDetail />} />
        <Route path="/product-detail/:id" element={<ProductDetail />} />
        <Route path="/review" element={<Review />} />

        <Route path="/cart" element={<RoleRoute allowedRoles={[1, 2, 3, 4]}><Cart /></RoleRoute>} />
        <Route path="/checkout" element={<RoleRoute allowedRoles={[1, 2, 3, 4]}><CheckoutPage /></RoleRoute>} />
        <Route path="/payment/qr" element={<RoleRoute allowedRoles={[1, 2, 3, 4]}><PaymentQRPage /></RoleRoute>} />
        <Route path="/payment/success" element={<RoleRoute allowedRoles={[1, 2, 3, 4]}><PaymentSuccess /></RoleRoute>} />
        <Route path="/payment/cancel" element={<RoleRoute allowedRoles={[1, 2, 3, 4]}><PaymentCancel /></RoleRoute>} />
        <Route path="/orders" element={<RoleRoute allowedRoles={[1, 2, 3, 4]}><OrdersPage /></RoleRoute>} />
        <Route path="/profile" element={<RoleRoute allowedRoles={[1, 2, 3, 4]}><Profile /></RoleRoute>} />
        <Route path="/notifications" element={<RoleRoute allowedRoles={[1, 2, 3, 4]}><NotificationsPage /></RoleRoute>} />
        
        <Route path="/admin/products" element={<RoleRoute allowedRoles={[1]}><AdminProduct /></RoleRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
