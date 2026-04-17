import { useEffect, useState } from "react";
import { fetchCart, updateCartItem, removeCartItem, clearCartItems } from "../../services/cartApi";
import { Trash2, ShieldCheck, RotateCcw, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
 
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

function formatPrice(n) {
    const value = Number(n) || 0;
    return value.toLocaleString("vi-VN") + " ₫";
}

export default function Cart() {
    const [cart, setCart] = useState([]);

    const navigate = useNavigate();

    const mapCartRows = (rows) => {
        return (rows || []).map((x) => ({
            id: x.ProductID,
            name: x.ProductName,
            brand: x.Brand,
            price: Number(x.Price) || 0,
            qty: x.Quantity,
        }));
    };

    useEffect(() => {
        const load = async () => {
            try {
                const rows = await fetchCart();
                setCart(mapCartRows(rows));
            } catch (e) {
                alert(e.message);
                if (e.message.includes("đăng nhập")) navigate("/login");
            }
        };
        load();
    }, [navigate]);


    const updateQty = async (id, delta) => {
        const item = cart.find((x) => x.id === id);
        if (!item) return;
        const nextQty = item.qty + delta;
        try {
            const rows = await updateCartItem(id, nextQty);
            setCart(mapCartRows(rows));
            window.dispatchEvent(new Event("cart:updated"));
        } catch (e) { alert(e.message); }
    };


    const removeItem = async (id) => {
        try {
            const rows = await removeCartItem(id);
            setCart(mapCartRows(rows));
            window.dispatchEvent(new Event("cart:updated"));
        } catch (e) {
            alert(e.message);
        }
    };

    const handleClearCart = async () => {
        try {
            await clearCartItems();
            setCart([]);
            window.dispatchEvent(new Event("cart:updated"));
        } catch (e) {
            alert(e.message);
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shippingFee = 0;
    const discount = 0;
    const total = subtotal + shippingFee - discount;

    return (
        <div>
            <Navbar />
            <div className="min-vh-100 px-3 px-md-4" style={{ background: "#f5f6fa", paddingTop: "90px", paddingBottom: "40px" }}>
                <div className="container" style={{ maxWidth: 1200 }}>
                    <div className="mb-4">
                        <h2 className="fw-bold mb-1" style={{ fontSize: 24 }}>Giỏ hàng của bạn</h2>
                        <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                            Bạn có {cart.length} sản phẩm trong giỏ hàng
                        </p>
                    </div>

                    <div className="row g-3 g-md-4 align-items-start">
                        <div className="col-lg-8">
                            {cart.length === 0 ? (
                                <div
                                    className="card border text-center py-5"
                                    style={{ borderRadius: 12, borderColor: "#eee" }}
                                >
                                    <p className="text-muted mb-3">Giỏ hàng của bạn đang trống</p>
                                    <button
                                        className="btn mx-auto"
                                        style={{ background: "#4285f4", color: "#fff", borderRadius: 8, width: 180 }}
                                        onClick={() => navigate("/product")}
                                    >
                                        Mua sắm ngay
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="card border mb-3" style={{ borderRadius: 12, borderColor: "#eee" }}>
                                        <div className="card-body p-3 p-md-4">
                                            <h5 className="fw-bold mb-3" style={{ fontSize: 16 }}>Sản phẩm đã chọn</h5>
                                            {cart.map((item, index) => (
                                                <div key={item.id}>
                                                    <div className="d-flex align-items-center gap-3 py-2">

                                                        {/* Ảnh */}
                                                        <div
                                                            className="d-flex align-items-center justify-content-center flex-shrink-0"
                                                            style={{ width: 60, height: 60, background: "#f0f2f5", borderRadius: 8 }}
                                                        >
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                            </svg>
                                                        </div>

                                                        {/* Tên & giá */}
                                                        <div className="flex-grow-1">
                                                            <div className="fw-bold" style={{ fontSize: 14 }}>{item.name}</div>
                                                            <div className="text-muted mb-1" style={{ fontSize: 12 }}>{item.brand}</div>
                                                            <div className="fw-semibold" style={{ color: "#4285f4", fontSize: 13 }}>
                                                                {formatPrice(item.price)}
                                                            </div>
                                                        </div>

                                                        {/* Nút xóa */}
                                                        <button
                                                            className="btn p-1 ms-2"
                                                            style={{ color: "#e53e3e", border: "none", background: "none" }}
                                                            onClick={() => removeItem(item.id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>

                                                        {/* Điều chỉnh số lượng */}
                                                        <div className="d-flex align-items-center gap-2">
                                                            <button
                                                                className="btn p-0 d-flex align-items-center justify-content-center"
                                                                style={{ width: 28, height: 28, border: "1px solid #ddd", borderRadius: 6, background: "#fff", fontSize: 16, color: "#555" }}
                                                                onClick={() => updateQty(item.id, -1)}
                                                            >
                                                                −
                                                            </button>
                                                            <span style={{ minWidth: 20, textAlign: "center", fontSize: 13, fontWeight: 600 }}>
                                                                {item.qty}
                                                            </span>
                                                            <button
                                                                className="btn p-0 d-flex align-items-center justify-content-center"
                                                                style={{ width: 28, height: 28, border: "1px solid #ddd", borderRadius: 6, background: "#fff", fontSize: 16, color: "#555" }}
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

                                                    {index < cart.length - 1 && <hr className="my-2" style={{ borderColor: "#f0f0f0" }} />}
                                                </div>
                                            ))}

                                            <div className="d-flex gap-2 mt-3 pt-3" style={{ borderTop: "1px solid #f0f0f0" }}>

                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <button
                                            className="btn"
                                            style={{ color: "#e53e3e", fontSize: 13, border: "none", background: "none" }}
                                            onClick={handleClearCart}
                                        >
                                            Xóa toàn bộ giỏ hàng
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="col-lg-4">
                            <div className="card border mb-3" style={{ borderRadius: 12, borderColor: "#eee" }}>
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
                                        <span className="fw-semibold" style={{ color: "#e53e3e" }}>-{formatPrice(discount)}</span>
                                    </div>

                                    <hr style={{ borderColor: "#eee" }} />

                                    <div className="d-flex justify-content-between mb-3">
                                        <span className="fw-bold" style={{ fontSize: 14 }}>Tổng cộng</span>
                                        <span className="fw-bold" style={{ fontSize: 18, color: "#4285f4" }}>
                                            {formatPrice(total)}
                                        </span>
                                    </div>

                                    <button
                                        className="btn w-100 fw-semibold mb-2"
                                        style={{ height: 44, background: "#4285f4", color: "#fff", borderRadius: 8, fontSize: 15, border: "none" }}
                                        disabled={cart.length === 0}
                                        onClick={() => navigate("/checkout")}
                                    >
                                        Tiến hành thanh toán
                                    </button>

                                    <button
                                        className="btn w-100 fw-semibold"
                                        style={{ height: 44, background: "#fff", color: "#333", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
                                        onClick={() => navigate("/product")}
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
                </div>
            </div>
            <Footer />
        </div>
    );
}
