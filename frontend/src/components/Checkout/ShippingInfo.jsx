const ShippingInfo = ({ formData, onFormChange }) => {
  return (
    <div className="card border" style={{ borderRadius: 12, borderColor: '#eee' }}>
      <div className="card-body p-3 p-md-4">
        <h5 className="fw-bold mb-3" style={{ fontSize: 16 }}>Thông tin giao hàng</h5>
        
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label text-muted" style={{ fontSize: 13 }}>Họ và tên</label>
            <input
              className="form-control"
              placeholder="Nguyễn Văn A"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={onFormChange}
              style={{ borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, height: 42 }}
            />
          </div>
          
          <div className="col-md-6">
            <label className="form-label text-muted" style={{ fontSize: 13 }}>Số điện thoại</label>
            <input
              className="form-control"
              placeholder="0912 345 678"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onFormChange}
              style={{ borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, height: 42 }}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label text-muted" style={{ fontSize: 13 }}>Tỉnh/Thành phố</label>
            <select
              className="form-select"
              name="city"
              value={formData.city}
              onChange={onFormChange}
              style={{ borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, height: 42 }}
            >
              <option>TP. Hồ Chí Minh</option>
              <option>Hà Nội</option>
              <option>Đà Nẵng</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label text-muted" style={{ fontSize: 13 }}>Quận/Huyện</label>
            <input
              className="form-control"
              placeholder="Quận 1"
              type="text"
              name="district"
              value={formData.district}
              onChange={onFormChange}
              style={{ borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, height: 42 }}
            />
          </div>

          <div className="col-12">
            <label className="form-label text-muted" style={{ fontSize: 13 }}>Phường/Xã</label>
            <input
              className="form-control"
              placeholder="Phường Bến Nghé"
              type="text"
              name="ward"
              value={formData.ward}
              onChange={onFormChange}
              style={{ borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, height: 42 }}
            />
          </div>

          <div className="col-12">
            <label className="form-label text-muted" style={{ fontSize: 13 }}>Địa chỉ chi tiết</label>
            <textarea
              className="form-control"
              placeholder="Số nhà, tên đường..."
              rows="2"
              name="address"
              value={formData.address}
              onChange={onFormChange}
              style={{ borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
