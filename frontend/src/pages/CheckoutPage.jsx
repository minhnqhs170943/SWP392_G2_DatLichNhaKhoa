import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartItemList from '../components/Checkout/CartItemList';
import ShippingInfo from '../components/Checkout/ShippingInfo';
import OrderSummary from '../components/Checkout/OrderSummary';
import PaymentMethods from '../components/Checkout/PaymentMethods';
import 'bootstrap/dist/css/bootstrap.min.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Kem đánh răng phục hồi men răng',
      brand: 'Bio-Enamel',
      description: 'Công thức chuyên sâu cho răng nhạy cảm, 75ml',
      price: 450000,
      quantity: 1,
    },
    {
      id: 2,
      name: 'Bàn chải lông mềm cao cấp',
      brand: 'Precision',
      description: 'Công nghệ lông tơ, bộ 2 cái',
      price: 300000,
      quantity: 2,
    }
  ]);

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [promoCode, setPromoCode] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: 'TP. Hồ Chí Minh',
    district: '',
    ward: '',
    address: ''
  });

  const shippingFee = 30000;
  const discount = 50000;

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

  const handleCheckout = () => {
    if (!formData.fullName || !formData.phone || !formData.district || !formData.ward || !formData.address) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }
    console.log('Đặt hàng:', { cartItems, paymentMethod, formData });
    alert('Đặt hàng thành công!');
    navigate('/home');
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
                promoCode={promoCode}
                onPromoCodeChange={setPromoCode}
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
                shippingFee={shippingFee}
                discount={discount}
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
