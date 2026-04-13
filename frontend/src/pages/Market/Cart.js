// Cart.js
import { useState } from "react";
import { Trash2, ShieldCheck, RotateCcw, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const initCart = [
    { id: 2, brand: "Unique", name: "Gel bôi nướu Metrogyl Denta", price: 65000, qty: 1 },
];

function formatPrice(n) {
    return n.toLocaleString("vi-VN") + " ₫";
}

export default function Cart() {
    const [cart, setCart] = useState(initCart);
    const navigate = useNavigate();

    const updateQty = (id, delta) => {
        setCart((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
            )
        );
    };

    const removeItem = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const clearCart = () => setCart([]);

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const total = subtotal;

    return (
        <div className="min-vh-100 py-4 px-4" style={{ background: "#f5f6fa" }}>
            <h2 className="fw-bold mb-1">Giỏ hàng của bạn</h2>
            <p className="text-muted mb-4" style={{ fontSize: 14 }}>
                Bạn có {cart.length} sản phẩm trong giỏ hàng
            </p>

            <div className="row g-4 align-items-start">

                {/* Danh sách sản phẩm */}
                <div className="col-lg-8">
                    {cart.length === 0 ? (
                        <div
                            className="card border text-center py-5"
                            style={{ borderRadius: 16, borderColor: "#eee" }}
                        >
                            <p className="text-muted mb-3">Giỏ hàng của bạn đang trống</p>
                            <button
                                className="btn mx-auto"
                                style={{ background: "#1DA0E0", color: "#fff", borderRadius: 10, width: 180 }}
                                onClick={() => navigate("/thuoc-nha-khoa")}
                            >
                                Mua sắm ngay
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="card border p-3 mb-3" style={{ borderRadius: 16, borderColor: "#eee" }}>
                                {cart.map((item, index) => (
                                    <div key={item.id}>
                                        <div className="d-flex align-items-center gap-3 py-2">

                                            {/* Ảnh */}
                                            <div
                                                className="d-flex align-items-center justify-content-center flex-shrink-0"
                                                style={{ width: 80, height: 80, background: "#f0f2f5", borderRadius: 10 }}
                                            >
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                </svg>
                                            </div>

                                            {/* Tên & giá */}
                                            <div className="flex-grow-1">
                                                <div className="fw-bold" style={{ fontSize: 14 }}>{item.name}</div>
                                                <div className="text-muted mb-1" style={{ fontSize: 12 }}>Thương hiệu: {item.brand}</div>
                                                <div className="fw-bold" style={{ color: "#1DA0E0", fontSize: 14 }}>
                                                    {formatPrice(item.price)}
                                                </div>
                                            </div>

                                            {/* Nút xóa */}
                                            <button
                                                className="btn p-1 ms-2"
                                                style={{ color: "#e53e3e", border: "none", background: "none" }}
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                            {/* Điều chỉnh số lượng */}
                                            <div className="d-flex align-items-center gap-2">
                                                <button
                                                    className="btn p-0 d-flex align-items-center justify-content-center"
                                                    style={{ width: 32, height: 32, border: "1px solid #ddd", borderRadius: 8, background: "#fff", fontSize: 18, color: "#555" }}
                                                    onClick={() => updateQty(item.id, -1)}
                                                >
                                                    −
                                                </button>
                                                <span style={{ minWidth: 24, textAlign: "center", fontSize: 14, fontWeight: 600 }}>
                                                    {item.qty}
                                                </span>
                                                <button
                                                    className="btn p-0 d-flex align-items-center justify-content-center"
                                                    style={{ width: 32, height: 32, border: "1px solid #ddd", borderRadius: 8, background: "#fff", fontSize: 18, color: "#555" }}
                                                    onClick={() => updateQty(item.id, 1)}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Thành tiền */}
                                            <div style={{ minWidth: 80, textAlign: "right", fontSize: 14, fontWeight: 500 }}>
                                                {formatPrice(item.price * item.qty)}
                                            </div>
                                        </div>

                                        {index < cart.length - 1 && <hr className="my-1" style={{ borderColor: "#f0f0f0" }} />}
                                    </div>
                                ))}
                            </div>

                            <div className="text-center">
                                <button
                                    className="btn"
                                    style={{ color: "#e53e3e", fontSize: 13, border: "none", background: "none" }}
                                    onClick={clearCart}
                                >
                                    Xóa tất cả sản phẩm
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Tổng đơn hàng */}
                <div className="col-lg-4">
                    <div className="card border p-4" style={{ borderRadius: 16, borderColor: "#eee" }}>
                        <h5 className="fw-bold mb-3">Tổng đơn hàng</h5>

                        <div className="d-flex justify-content-between mb-2" style={{ fontSize: 14 }}>
                            <span className="text-muted">Tạm tính</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>

                        <div className="d-flex justify-content-between mb-3" style={{ fontSize: 14 }}>
                            <span className="text-muted">Phí vận chuyển</span>
                            <span style={{ color: "#38a169", fontWeight: 500 }}>Miễn phí</span>
                        </div>

                        <hr style={{ borderColor: "#eee" }} />

                        <div className="d-flex justify-content-between mb-4">
                            <span className="fw-bold" style={{ fontSize: 15 }}>Tổng cộng</span>
                            <span className="fw-bold" style={{ fontSize: 16, color: "#1DA0E0" }}>
                                {formatPrice(total)}
                            </span>
                        </div>

                        <button
                            className="btn w-100 fw-semibold mb-2"
                            style={{ height: 46, background: "#1DA0E0", color: "#fff", borderRadius: 10, fontSize: 15 }}
                            disabled={cart.length === 0}
                        >
                            Thanh toán
                        </button>

                        <button
                            className="btn w-100 fw-semibold"
                            style={{ height: 46, background: "#fff", color: "#333", border: "1px solid #ddd", borderRadius: 10, fontSize: 14 }}
                            onClick={() => navigate("/thuoc-nha-khoa")}
                        >
                            Tiếp tục mua sắm
                        </button>

                        <hr style={{ borderColor: "#eee" }} />

                        <div className="d-flex flex-column gap-2" style={{ fontSize: 13 }}>
                            {[
                                { icon: <Truck size={15} color="#38a169" />, text: "Miễn phí vận chuyển" },
                                { icon: <ShieldCheck size={15} color="#38a169" />, text: "Thanh toán an toàn" },
                                { icon: <RotateCcw size={15} color="#38a169" />, text: "Đổi trả trong 7 ngày" },
                            ].map((item, i) => (
                                <div key={i} className="d-flex align-items-center gap-2 text-muted">
                                    {item.icon}
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}