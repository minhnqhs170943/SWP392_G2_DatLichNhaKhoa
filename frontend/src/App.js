import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
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
import OrdersPage from './pages/OrdersPage';
import PaymentCancel from './pages/PaymentCancel';
import PaymentQRPage from './pages/PaymentQRPage';
import PaymentSuccess from './pages/PaymentSuccess';
import OrdersPage from './pages/OrdersPage';
import NotificationsPage from './pages/NotificationsPage';
import Review from './pages/Market/Review';
import AdminProduct from './pages/Admin/AdminProduct';



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
        <Route path='/payment/qr' element={<PaymentQRPage />} />
        <Route path='/payment/success' element={<PaymentSuccess />} />
        <Route path='/payment/cancel' element={<PaymentCancel />} />
        <Route path='/orders' element={<OrdersPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path='/notifications' element={<NotificationsPage />} />
        <Route path='/review' element= {<Review/>}/>
        <Route path='/admin/products' element={<AdminProduct />} />
      </Routes>
    </Router>
  );
}

export default App;
