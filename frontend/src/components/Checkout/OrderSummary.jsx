const OrderSummary = ({ subtotal, appointmentSubtotal = 0 }) => {
  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };
  const total = subtotal + appointmentSubtotal;

  return (
    <div className="card border mb-3" style={{ borderRadius: 12, borderColor: '#eee' }}>
      <div className="card-body p-3 p-md-4">
        <h5 className="fw-bold mb-3" style={{ fontSize: 16 }}>Tổng đơn hàng</h5>
        
        <div className="d-flex justify-content-between mb-3" style={{ fontSize: 13 }}>
          <span className="text-muted">Sản phẩm</span>
          <span className="fw-semibold">{formatPrice(subtotal)}</span>
        </div>
        <div className="d-flex justify-content-between mb-3" style={{ fontSize: 13 }}>
          <span className="text-muted">Lịch hẹn</span>
          <span className="fw-semibold">{formatPrice(appointmentSubtotal)}</span>
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
