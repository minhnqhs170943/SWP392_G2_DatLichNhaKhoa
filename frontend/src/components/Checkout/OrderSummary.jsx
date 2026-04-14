const OrderSummary = ({ subtotal, shippingFee, discount }) => {
  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  const total = subtotal + shippingFee - discount;

  return (
    <div className="card border mb-3" style={{ borderRadius: 12, borderColor: '#eee' }}>
      <div className="card-body p-3 p-md-4">
        <h5 className="fw-bold mb-3" style={{ fontSize: 16 }}>Tổng đơn hàng</h5>
        
        <div className="d-flex justify-content-between mb-2" style={{ fontSize: 13 }}>
          <span className="text-muted">Tạm tính</span>
          <span className="fw-semibold">{formatPrice(subtotal)}</span>
        </div>
        
        <div className="d-flex justify-content-between mb-2" style={{ fontSize: 13 }}>
          <span className="text-muted">Phí vận chuyển</span>
          <span className="fw-semibold">{formatPrice(shippingFee)}</span>
        </div>
        
        <div className="d-flex justify-content-between mb-3" style={{ fontSize: 13 }}>
          <span className="text-muted">Giảm giá</span>
          <span className="fw-semibold" style={{ color: '#e53e3e' }}>-{formatPrice(discount)}</span>
        </div>

        <hr style={{ borderColor: '#eee' }} />

        <div className="d-flex justify-content-between mb-3">
          <span className="fw-bold" style={{ fontSize: 14 }}>Tổng cộng</span>
          <span className="fw-bold" style={{ fontSize: 18, color: '#4285f4' }}>
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
