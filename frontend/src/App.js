import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import RoleRoute from './components/RoleRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminBlog from './pages/Admin/AdminBlog';
import ProductManagement from './pages/Admin/ProductManagement';
import AdminServices from './pages/Admin/AdminServices';
import AdminAppointments from './pages/Admin/AdminAppointments';
import AdminAnalytics from './pages/Admin/AdminAnalytics';
import AdminOverview from './pages/Admin/AdminOverview';
import AdminInvoices from './pages/Admin/AdminInvoices';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Login from './pages/Auth/Login';
import Profile from './pages/Auth/Profile';
import Register from './pages/Auth/Register';
import BookingPage from './pages/Booking/BookingPage';
import MyAppointments from './pages/Booking/MyAppointments';
import CheckoutPage from './pages/CheckoutPage';
import StaffAppointments from './pages/Dashboard/StaffAppointments';
import StaffDashboard from './pages/Dashboard/StaffDashboard';
import UserManagement from './pages/Dashboard/UserManagement';
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
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import StaffInvoices from './pages/Dashboard/StaffInvoices';

// RoleID từ DB: 1-Admin, 2-Doctor, 3-Staff, 4-User
import BlogListPage from './pages/BlogListPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ContactPage from './pages/ContactPage';

// RoleID từ DB: 1-Admin, 2-Staff, 3-Doctor, 4-Patient
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
        <Route path="/blogs" element={<BlogListPage />} />
        <Route path="/blogs/:slug" element={<BlogDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Customer Booking */}
        <Route path="/booking" element={<RoleRoute allowedRoles={[1, 2, 3, 4]}><BookingPage /></RoleRoute>} />
        <Route path="/my-appointments" element={<RoleRoute allowedRoles={[1, 2, 3, 4]}><MyAppointments /></RoleRoute>} />

        {/* Cart & Payment */}
        <Route path="/cart" element={<RoleRoute allowedRoles={[1, 2, 3, 4]}><Cart /></RoleRoute>} />
        <Route path="/checkout" element={<RoleRoute allowedRoles={[1, 2, 3, 4]}><CheckoutPage /></RoleRoute>} />
        <Route path="/payment/qr" element={<RoleRoute allowedRoles={[1, 2, 3, 4]}><PaymentQRPage /></RoleRoute>} />
        <Route path="/payment/success" element={<RoleRoute allowedRoles={[1, 2, 3, 4]}><PaymentSuccess /></RoleRoute>} />
        <Route path="/payment/cancel" element={<RoleRoute allowedRoles={[1, 2, 3, 4]}><PaymentCancel /></RoleRoute>} />
        <Route path="/orders" element={<RoleRoute allowedRoles={[1, 2, 3, 4]}><OrdersPage /></RoleRoute>} />
        <Route path="/profile" element={<RoleRoute allowedRoles={[1, 2, 3, 4]}><Profile /></RoleRoute>} />
        <Route path="/notifications" element={<RoleRoute allowedRoles={[1, 2, 3, 4]}><NotificationsPage /></RoleRoute>} />

        {/* Doctor */}
        <Route path="/doctor/dashboard" element={<RoleRoute allowedRoles={[2]}><DoctorDashboard /></RoleRoute>} />


        {/* Admin */}
        <Route path="/admin" element={<Navigate to="/admin/overview" />} />
        <Route path="/admin/overview" element={<RoleRoute allowedRoles={[1]}><AdminLayout><AdminOverview /></AdminLayout></RoleRoute>} />
        <Route path="/admin/stats" element={<RoleRoute allowedRoles={[1]}><AdminLayout><AdminAnalytics /></AdminLayout></RoleRoute>} />
        <Route path="/admin/products" element={<RoleRoute allowedRoles={[1]}><AdminLayout><ProductManagement /></AdminLayout></RoleRoute>} />
        <Route path="/admin/blogs" element={<RoleRoute allowedRoles={[1]}><AdminLayout><AdminBlog /></AdminLayout></RoleRoute>} />
        <Route path="/admin/users" element={<RoleRoute allowedRoles={[1]}><AdminLayout><UserManagement /></AdminLayout></RoleRoute>} />
        <Route path="/admin/services" element={<RoleRoute allowedRoles={[1]}><AdminLayout><AdminServices /></AdminLayout></RoleRoute>} />
        <Route path="/admin/appointments" element={<RoleRoute allowedRoles={[1]}><AdminLayout><AdminAppointments /></AdminLayout></RoleRoute>} />
        <Route path="/admin/invoices" element={<RoleRoute allowedRoles={[1]}><AdminLayout><AdminInvoices /></AdminLayout></RoleRoute>} />

        {/* Staff Dashboard */}
        <Route path="/staff/dashboard" element={<RoleRoute allowedRoles={[1, 3]}><StaffDashboard /></RoleRoute>} />
        <Route path="/staff/appointments" element={<RoleRoute allowedRoles={[1, 3]}><StaffAppointments /></RoleRoute>} />
        <Route path="/staff/invoices" element={<RoleRoute allowedRoles={[1, 3]}><StaffInvoices /></RoleRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
