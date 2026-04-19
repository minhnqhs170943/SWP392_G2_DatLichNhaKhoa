// ProductDetail.js
import { ShoppingCart, ArrowLeft, Star, Shield, Truck, RotateCcw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { addCartItem } from "../../services/cartApi";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { fetchProductById } from "../../services/productApi";
import { useState, useEffect } from "react";

function formatPrice(value) {
    const normalized = Number(String(value).replace(/[^\d.-]/g, "")) || 0;
    return normalized.toLocaleString("vi-VN") + " ₫";
}





function StarRating({ rating }) {
    return (
        <div className="d-flex align-items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    size={14}
                    fill={s <= Math.round(rating) ? "#f59e0b" : "none"}
                    color={s <= Math.round(rating) ? "#f59e0b" : "#ccc"}
                />
            ))}
            <span className="ms-1 text-muted" style={{ fontSize: 13 }}>{rating} / 5</span>
        </div>
    );
}

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [product, setProduct] = useState(null);
    useEffect(() => {

        const loadProduct = async () => {
            try {
                setLoading(true);
                const row = await fetchProductById(id);


                const d = {
                    id: row.ProductID,
                    name: row.ProductName,
                    brand: row.Brand || "Nhãn hiệu",
                    desc: row.Description || "Đang cập nhật thông tin sản phẩm.",
                    price: row.Price,
                    rating: 0,
                    reviews: 0,
                    specialty: "Đang cập nhật",
                };


                setProduct(d);
                setError("");
            } catch (e) {
                setError(e.message || "Không tải được danh sách sản phẩm");
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, []);


    if (!product) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <h4 className="fw-bold mb-2">Không tìm thấy sản phẩm</h4>
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>Quay lại</button>
                </div>
            </div>
        );
    }

    const handleAddToCart = async (product) => {
        try {
            await addCartItem(product.id, 1);
            window.dispatchEvent(new Event("cart:updated"));
        } catch (e) {
            alert(e.message);
            if (e.message.includes("đăng nhập")) navigate("/login");
        }
    };


    const handleBuyNow = async (product) => {
        try {
            await addCartItem(product.id, 1);
            window.dispatchEvent(new Event("cart:updated"));
            navigate("/cart");
        } catch (e) {
            alert(e.message);
            if (e.message.includes("đăng nhập")) navigate("/login");
        }
    };
    return (
        <div>
            <Navbar />
            <div className="min-vh-100 py-4 px-4" style={{ background: "#f5f6fa" }}>

                <button
                    className="btn d-flex align-items-center gap-2 mb-4 text-muted"
                    style={{ fontSize: 13 }}
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={16} /> Quay lại
                </button>

                <div className="row g-4">

                    {/* Ảnh sản phẩm */}
                    <div className="col-md-5">
                        <div
                            className="card border d-flex align-items-center justify-content-center"
                            style={{ height: 340, borderRadius: 16, borderColor: "#eee", background: "#f0f2f5" }}
                        >
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 3h6M9 3v7l-4 8a2 2 0 0 0 1.8 2.9h10.4A2 2 0 0 0 19 18l-4-8V3" />
                                <line x1="6.5" y1="14" x2="17.5" y2="14" />
                            </svg>
                        </div>
                    </div>

                    {/* Thông tin sản phẩm */}
                    <div className="col-md-7">
                        <div className="card border h-100 p-4" style={{ borderRadius: 16, borderColor: "#eee" }}>
                            <div style={{ fontSize: 12, color: "#1DA0E0", fontWeight: 600 }} className="mb-1">{product.brand}</div>
                            <h2 className="fw-bold mb-2" style={{ fontSize: 20 }}>{product.name}</h2>

                            <p className="text-muted mb-3" style={{ fontSize: 14, lineHeight: 1.7 }}>{product.desc}</p>

                            <div className="fw-bold mb-4" style={{ fontSize: 24, color: "#1DA0E0" }}>
                                {formatPrice(product.price)}
                            </div>

                            <div className="d-flex gap-2 mb-4">
                                <button
                                    className="btn d-flex align-items-center justify-content-center"
                                    style={{ width: 48, height: 44, border: "1.5px solid #1DA0E0", borderRadius: 10, color: "#1DA0E0" }}
                                    onClick={() => handleAddToCart(product)}
                                >
                                    <ShoppingCart size={18} />
                                </button>
                                <button
                                    className="btn flex-grow-1 fw-semibold"
                                    style={{ height: 44, background: "#1DA0E0", color: "#fff", borderRadius: 10, fontSize: 14 }}
                                    onClick={() => handleBuyNow(product)}
                                >
                                    Mua ngay
                                </button>
                            </div>

                            <div className="row g-2">
                                {[
                                    { icon: <Shield size={14} />, text: "Hàng chính hãng" },
                                    { icon: <Truck size={14} />, text: "Giao hàng toàn quốc" },
                                    { icon: <RotateCcw size={14} />, text: "Đổi trả trong 7 ngày" },
                                ].map((item, i) => (
                                    <div key={i} className="col-4">
                                        <div
                                            className="d-flex align-items-center gap-2 p-2 rounded"
                                            style={{ background: "#f0f7ff", fontSize: 12, color: "#1DA0E0" }}
                                        >
                                            {item.icon} {item.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chi tiết sản phẩm */}
                <div className="row g-4 mt-1">
                    {[
                        { title: "Mô tả chi tiết", content: product.desc },
                        { title: "Cách dùng", content: product.specialty },
                        { title: "Nhãn hiệu", content: product.brand },
                        { title: "Kho", content: product.warning },
                    ].map((section, i) => (
                        <div key={i} className="col-md-6">
                            <div className="card border p-3" style={{ borderRadius: 12, borderColor: "#eee" }}>
                                <div className="fw-bold mb-2" style={{ fontSize: 14 }}>{section.title}</div>
                                <p className="text-muted mb-0" style={{ fontSize: 13, lineHeight: 1.7 }}>{section.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            <Footer />
        </div>

    );
}
