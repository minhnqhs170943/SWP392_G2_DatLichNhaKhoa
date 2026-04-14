import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartItemList from '../components/Checkout/CartItemList';
import ShippingInfo from '../components/Checkout/ShippingInfo';
import OrderSummary from '../components/Checkout/OrderSummary';
import PaymentMethods from '../components/Checkout/PaymentMethods';
import paymentService from '../services/paymentService';
import 'bootstrap/dist/css/bootstrap.min.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Kem đánh răng phục hồi men răng',
      brand: 'Bio-Enamel',
      description: 'Công thức chuyên sâu cho răng nhạy cảm, 75ml',
      price: 3000,
      quantity: 1,
    },
    {
      id: 2,
      name: 'Bàn chải lông mềm cao cấp',
      brand: 'Precision',
      description: 'Công nghệ lông tơ, bộ 2 cái',
      price: 5000,
      quantity: 2,
    }
  ]);

  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: 'TP. Hồ Chí Minh',
    district: '',
    ward: '',
    address: ''
  });

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const updateQty = (id, delta) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (!formData.fullName || !formData.phone || !formData.district || !formData.ward || !formData.address) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    try {
      // Lấy userId từ localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('Vui lòng đăng nhập để thanh toán!');
        navigate('/login');
        return;
      }
      
      const user = JSON.parse(userStr);
      const userId = user.UserID;
      
      const shippingAddress = `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`;
      
      // Chuẩn bị dữ liệu thanh toán
      const paymentData = {
        userId: parseInt(userId),
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        shippingAddress: shippingAddress,
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      };

      if (paymentMethod === 'payos') {
        // Thanh toán qua PayOS
        const response = await paymentService.createPayment(paymentData);
        
        if (response.success) {
          // Tính tổng tiền
          const total = calculateSubtotal();
          
          // Chuyển đến trang QR riêng thay vì redirect trực tiếp
          navigate('/payment/qr', {
            state: {
              paymentData: {
                orderId: response.data.orderId,
                checkoutUrl: response.data.checkoutUrl,
                qrCode: response.data.qrCode,
                amount: total
              }
            }
          });
        } else {
          alert('Lỗi tạo thanh toán: ' + response.message);
        }
      } else if (paymentMethod === 'cod') {
        // Thanh toán COD - Tạo order luôn
        const response = await paymentService.createPayment({
          ...paymentData,
          paymentMethod: 'COD'
        });
        
        if (response.success) {
          // Redirect đến trang success với thông tin đơn hàng
          const total = calculateSubtotal();
          navigate('/payment/success', {
            state: {
              orderData: {
                orderId: response.data.orderId,
                totalAmount: total,
                paymentMethod: 'COD'
              }
            }
          });
        } else {
          alert('Lỗi tạo đơn hàng: ' + response.message);
        }
      } else {
        alert('Vui lòng chọn phương thức thanh toán!');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Có lỗi xảy ra khi thanh toán. Vui lòng thử lại!');
    }
  };

  return (
    <div>
      <Navbar />
      
      <div className="min-vh-100 px-3 px-md-4" style={{ background: '#f5f6fa', paddingTop: '90px', paddingBottom: '40px' }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          
          {/* Header */}
          <div className="mb-4">
            <h2 className="fw-bold mb-1" style={{ fontSize: 24 }}>Thanh toán</h2>
            <p className="text-muted mb-0" style={{ fontSize: 14 }}>
              Xác nhận thông tin và hoàn tất đơn hàng
            </p>
          </div>

          <div className="row g-3 g-md-4">
            
            {/* LEFT COLUMN */}
            <div className="col-lg-8">
              <CartItemList
                cartItems={cartItems}
                onUpdateQty={updateQty}
                onRemoveItem={removeItem}
              />
              
              <ShippingInfo
                formData={formData}
                onFormChange={handleFormChange}
              />
            </div>

            {/* RIGHT COLUMN */}
            <div className="col-lg-4">
              <OrderSummary
                subtotal={calculateSubtotal()}
              />
              
              <PaymentMethods
                selectedMethod={paymentMethod}
                onMethodChange={setPaymentMethod}
                onCheckout={handleCheckout}
                disabled={cartItems.length === 0}
              />
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
