const CartItemList = ({ cartItems, onUpdateQty, onRemoveItem }) => {
  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div className="card border mb-3" style={{ borderRadius: 12, borderColor: '#eee' }}>
      <div className="card-body p-3 p-md-4">
        <h5 className="fw-bold mb-3" style={{ fontSize: 16 }}>Sản phẩm đã chọn</h5>
        
        {cartItems.map((item, index) => (
          <div key={item.id}>
            <div className="d-flex align-items-center gap-3 py-2">
              
              {/* Ảnh placeholder */}
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 60, height: 60, background: '#f0f2f5', borderRadius: 8 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </div>

              {/* Thông tin sản phẩm */}
              <div className="flex-grow-1">
                <div className="fw-bold mb-0" style={{ fontSize: 14 }}>{item.name}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>{item.description}</div>
                <div className="fw-semibold mt-1" style={{ color: '#4285f4', fontSize: 13 }}>
                  {formatPrice(item.price)}
                </div>
              </div>

              {/* Số lượng */}
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn p-0 d-flex align-items-center justify-content-center"
                  style={{ width: 28, height: 28, border: '1px solid #ddd', borderRadius: 6, background: '#fff', fontSize: 16 }}
                  onClick={() => onUpdateQty(item.id, -1)}
                >
                  −
                </button>
                <span style={{ minWidth: 20, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
                  {item.quantity}
                </span>
                <button
                  className="btn p-0 d-flex align-items-center justify-content-center"
                  style={{ width: 28, height: 28, border: '1px solid #ddd', borderRadius: 6, background: '#fff', fontSize: 16 }}
                  onClick={() => onUpdateQty(item.id, 1)}
                >
                  +
                </button>
              </div>

              {/* Xóa */}
              <button
                className="btn p-1"
                style={{ color: '#e53e3e', border: 'none', background: 'none', fontSize: 13 }}
                onClick={() => onRemoveItem(item.id)}
              >
                Xóa
              </button>
            </div>
            {index < cartItems.length - 1 && <hr className="my-2" style={{ borderColor: '#f0f0f0' }} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartItemList;
