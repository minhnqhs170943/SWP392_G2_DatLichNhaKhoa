import { Banknote, QrCode } from 'lucide-react';

const PaymentMethods = ({ selectedMethod, onMethodChange, onCheckout, disabled }) => {
  const paymentOptions = [
    { id: 'cod', name: 'COD', desc: 'Thanh toán khi nhận hàng', icon: Banknote, color: '#38a169' },
    { id: 'payos', name: 'PayOS', desc: 'Thanh toán qua PayOS (QR Code)', icon: QrCode, color: '#ff6b35' }
  ];

  return (
    <div className="card border" style={{ borderRadius: 12, borderColor: '#eee' }}>
      <div className="card-body p-3 p-md-4">
        <h5 className="fw-bold mb-3" style={{ fontSize: 16 }}>Phương thức thanh toán</h5>
        
        <div className="d-flex flex-column gap-2">
          {paymentOptions.map(method => {
            const IconComponent = method.icon;
            return (
              <label
                key={method.id}
                className="d-flex align-items-center gap-3 p-3"
                style={{
                  border: selectedMethod === method.id ? '2px solid #4285f4' : '1px solid #e0e0e0',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: selectedMethod === method.id ? '#e8f0fe' : '#fff',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => onMethodChange(e.target.value)}
                  style={{ width: 18, height: 18 }}
                />
                <div 
                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 8, 
                    background: `${method.color}15`
                  }}
                >
                  <IconComponent size={18} color={method.color} />
                </div>
                <div className="flex-grow-1">
                  <div className="fw-bold" style={{ fontSize: 14 }}>{method.name}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>{method.desc}</div>
                </div>
              </label>
            );
          })}
        </div>

        <button
          onClick={onCheckout}
          className="btn w-100 fw-semibold mt-3"
          style={{ height: 44, background: '#4285f4', color: '#fff', borderRadius: 8, fontSize: 15, border: 'none' }}
          disabled={disabled}
        >
          Đặt hàng
        </button>

        <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: 11 }}>
          🔒 Thanh toán an toàn và bảo mật
        </p>
      </div>
    </div>
  );
};

export default PaymentMethods;
