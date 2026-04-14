import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Product from './pages/Market/Product';
import ProductDetail from './pages/Market/ProductDetail';
import Cart from './pages/Market/Cart';
import AdminAnalytics from './pages/Admin/AdminAnalytics';

function App() {
  return (
    <Router>
      <Routes>
        {/* Tự động chuyển hướng từ trang chủ sang trang login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Định nghĩa đường dẫn cho từng màn hình */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product" element={<Product />} />
        <Route path="/product-detail/:id" element={<ProductDetail />} />
        <Route path='/cart' element={<Cart />} />
        
        {/* Dashboards */}
        <Route path='/admin-analytics' element={<AdminAnalytics />} />
      </Routes>
    </Router>
  );
}

export default App;