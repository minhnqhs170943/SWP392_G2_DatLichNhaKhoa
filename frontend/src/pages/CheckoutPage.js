import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartItemList from '../components/Checkout/CartItemList';
import ShippingInfo from '../components/Checkout/ShippingInfo';
import OrderSummary from '../components/Checkout/OrderSummary';
import PaymentMethods from '../components/Checkout/PaymentMethods';
import paymentService from '../services/paymentService';
import { clearCartItems, fetchCart, removeCartItem, updateCartItem } from '../services/cartApi';
import { getMyAppointments } from '../services/appointmentApi';
import 'bootstrap/dist/css/bootstrap.min.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedProductIdsFromState = Array.isArray(location.state?.selectedProductIds)
    ? location.state.selectedProductIds
    : null;

  const [cartItems, setCartItems] = useState([]);
  const [appointmentItems, setAppointmentItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: 'TP. Hồ Chí Minh',
    district: '',
    ward: '',
    address: '',
  });

  const mapCartRows = (rows) => {
    return (rows || []).map((x) => ({
      id: x.ProductID,
      name: x.ProductName,
      brand: x.Brand,
      description: x.Brand || '',
      price: Number(x.Price) || 0,
      quantity: x.Quantity,
    }));
  };

  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        const rows = await fetchCart();
        const mappedCart = mapCartRows(rows);
        if (selectedProductIdsFromState) {
          setCartItems(mappedCart.filter((item) => selectedProductIdsFromState.includes(item.id)));
        } else {
          setCartItems(mappedCart);
        }

        const stateAppointments = location.state?.appointmentItems;
        if (Array.isArray(stateAppointments)) {
          setAppointmentItems(stateAppointments);
          return;
        }

        const userStr = localStorage.getItem('user');
        if (!userStr) return;

        const user = JSON.parse(userStr);
        const appts = await getMyAppointments(user.UserID);
        const unpaidAppointments = (appts || []).filter((appt) => {
          const invoiceStatus = String(appt.InvoiceStatus || '').trim().toLowerCase();
          return Boolean(appt.InvoiceID) && invoiceStatus === 'unpaid';
        });
        setAppointmentItems(unpaidAppointments);
      } catch (e) {
        alert(e.message);
        if (e.message.includes('đăng nhập')) navigate('/login');
      }
    };

    loadCheckoutData();
  }, [navigate, location.state, selectedProductIdsFromState]);

  const calculateSubtotal = () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const calculateAppointmentSubtotal = () =>
    appointmentItems.reduce(
      (sum, item) => sum + Number(item.TotalAmount ?? item.InvoiceTotalAmount ?? item.TotalPrice ?? 0),
      0
    );
  const calculateGrandTotal = () => calculateSubtotal() + calculateAppointmentSubtotal();

  const updateQty = async (id, delta) => {
    const item = cartItems.find((x) => x.id === id);
    if (!item) return;

    const nextQty = item.quantity + delta;
    try {
      const rows = await updateCartItem(id, nextQty);
      const mappedCart = mapCartRows(rows);
      if (selectedProductIdsFromState) {
        setCartItems(mappedCart.filter((x) => selectedProductIdsFromState.includes(x.id)));
      } else {
        setCartItems(mappedCart);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const removeItem = async (id) => {
    try {
      const rows = await removeCartItem(id);
      const mappedCart = mapCartRows(rows);
      if (selectedProductIdsFromState) {
        setCartItems(mappedCart.filter((x) => selectedProductIdsFromState.includes(x.id)));
      } else {
        setCartItems(mappedCart);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (!formData.fullName || !formData.phone || !formData.district || !formData.ward || !formData.address) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    if (cartItems.length === 0 && appointmentItems.length === 0) {
      alert('Chưa có sản phẩm hoặc lịch hẹn để thanh toán');
      return;
    }

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('Vui lòng đăng nhập để thanh toán!');
        navigate('/login');
        return;
      }

      const user = JSON.parse(userStr);
      const userId = user.UserID || user.UserId || user.id;
      const shippingAddress = `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`;

      const paymentData = {
        userId: parseInt(userId, 10),
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        appointmentIds: appointmentItems.map((a) => a.AppointmentID),
        shippingAddress,
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
      };

      if (paymentMethod === 'payos') {
        const response = await paymentService.createPayment(paymentData);

        if (response.success) {
          const total = calculateGrandTotal();
          navigate('/payment/qr', {
            state: {
              paymentData: {
                orderId: response.data.orderId,
                checkoutUrl: response.data.checkoutUrl,
                qrCode: response.data.qrCode,
                amount: total,
              },
            },
          });
        } else {
          alert('Lỗi tạo thanh toán: ' + response.message);
        }
      } else if (paymentMethod === 'cod') {
        const response = await paymentService.createPayment({
          ...paymentData,
          paymentMethod: 'COD',
        });

        if (response.success) {
          if (selectedProductIdsFromState) {
            await Promise.all(selectedProductIdsFromState.map((productId) => removeCartItem(productId)));
          } else {
            await clearCartItems();
          }
          setCartItems([]);
          setAppointmentItems([]);

          const total = calculateGrandTotal();
          navigate('/payment/success', {
            state: {
              orderData: {
                orderId: response.data.orderId,
                totalAmount: total,
                paymentMethod: 'COD',
              },
            },
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
          <div className="mb-4">
            <h2 className="fw-bold mb-1" style={{ fontSize: 24 }}>Thanh toán</h2>
            <p className="text-muted mb-0" style={{ fontSize: 14 }}>
              Xác nhận thông tin và hoàn tất đơn hàng
            </p>
          </div>

          <div className="row g-3 g-md-4">
            <div className="col-lg-8">
              <CartItemList cartItems={cartItems} onUpdateQty={updateQty} onRemoveItem={removeItem} />

              {appointmentItems.length > 0 && (
                <div
                  className="card border mb-3"
                  style={{
                    borderRadius: 16,
                    borderColor: '#dbe7ff',
                    boxShadow: '0 8px 22px rgba(30,64,175,0.07)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
                  }}
                >
                  <div className="card-body p-3 p-md-4">
                    <h5 className="fw-bold mb-3" style={{ fontSize: 16 }}>Lịch hẹn thanh toán cùng đơn</h5>
                    {appointmentItems.map((appt, index) => (
                      <div key={appt.AppointmentID}>
                        <div
                          className="d-flex justify-content-between align-items-start py-2"
                          style={{
                            background: '#fff',
                            border: '1px solid #e5edff',
                            borderRadius: 12,
                            padding: '12px 14px',
                          }}
                        >
                          <div style={{ maxWidth: '75%' }}>
                            <div className="fw-bold" style={{ fontSize: 14 }}>Lịch hẹn #{appt.AppointmentID}</div>
                            <div
                              style={{
                                display: 'inline-block',
                                marginTop: 6,
                                marginBottom: 4,
                                padding: '2px 8px',
                                borderRadius: 999,
                                border: '1px solid #cfe0ff',
                                background: '#eaf2ff',
                                color: '#1e40af',
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              Dịch vụ
                            </div>
                            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.45 }}>
                              {appt.ServicesList || appt.ServiceNames || 'Dịch vụ khám'}
                            </div>
                            <div
                              style={{
                                display: 'inline-block',
                                marginTop: 6,
                                marginBottom: 4,
                                padding: '2px 8px',
                                borderRadius: 999,
                                border: '1px solid #cfe0ff',
                                background: '#eaf2ff',
                                color: '#1e40af',
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              Đơn thuốc
                            </div>
                            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.45 }}>
                              {appt.ProductsList || 'Không có đơn thuốc'}
                            </div>
                            <div className="d-flex gap-2 flex-wrap mt-2">
                              <div style={{ fontSize: 12, border: '1px solid #dbe7ff', borderRadius: 10, padding: '6px 10px', background: '#f8fbff' }}>
                                Tiền dịch vụ: <strong>{Number(appt.ServiceAmount || 0).toLocaleString('vi-VN')} ₫</strong>
                              </div>
                              <div style={{ fontSize: 12, border: '1px solid #dbe7ff', borderRadius: 10, padding: '6px 10px', background: '#f8fbff' }}>
                                Tiền sản phẩm: <strong>{Number(appt.ProductAmount || 0).toLocaleString('vi-VN')} ₫</strong>
                              </div>
                            </div>
                          </div>
                          <div className="fw-semibold" style={{ color: '#2563eb', fontSize: 13 }}>
                            Tổng: {Number(appt.TotalAmount ?? appt.InvoiceTotalAmount ?? appt.TotalPrice ?? 0).toLocaleString('vi-VN')} ₫
                          </div>
                        </div>
                        {index < appointmentItems.length - 1 && <hr className="my-2" style={{ borderColor: '#f0f0f0' }} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <ShippingInfo formData={formData} onFormChange={handleFormChange} />
            </div>

            <div className="col-lg-4">
              <OrderSummary subtotal={calculateSubtotal()} appointmentSubtotal={calculateAppointmentSubtotal()} />

              <PaymentMethods
                selectedMethod={paymentMethod}
                onMethodChange={setPaymentMethod}
                onCheckout={handleCheckout}
                disabled={cartItems.length === 0 && appointmentItems.length === 0}
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
