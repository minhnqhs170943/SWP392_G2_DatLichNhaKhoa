// Product.js
import { useState, useEffect } from "react";
import { ShoppingCart, Package } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { addCartItem } from "../../services/cartApi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { fetchProducts } from "../../services/productApi";

const styles = {
    page: { padding: "96px 56px 40px", background: "#f5f6fa", minHeight: "100vh" },
    container: { maxWidth: 1460, margin: "0 auto" },
    title: { fontSize: "clamp(30px, 3vw, 42px)", fontWeight: 800, color: "#0f172a", marginBottom: 8, letterSpacing: "-0.5px" },
    subtitle: { fontSize: 16, color: "#334155", marginBottom: 20 },
    searchFilterRow: {
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 20,
        alignItems: "center",
    },
    searchInput: {
        flex: "1 1 460px",
        height: 54,
        padding: "0 20px 0 52px",
        border: "1px solid #cbd5e1",
        borderRadius: 18,
        fontSize: 15,
        color: "#334155",
        outline: "none",
        minWidth: 280,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23aaa' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='M21 21l-4.35-4.35'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "20px center",
        backgroundSize: 24,
    },
    filterSelect: {
        minWidth: 190,
        height: 54,
        border: "1px solid #cbd5e1",
        borderRadius: 12,
        fontSize: 14,
        color: "#334155",
        background: "#fff",
        padding: "0 12px",
        outline: "none",
    },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 },
    card: {
        background: "#fff", borderRadius: 14,
        border: "1px solid #e2e8f0", overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: "0 2px 8px rgba(15,23,42,0.06)",
    },
    cardImg: {
        background: "#e5e7eb", height: 220,
        display: "flex", alignItems: "center", justifyContent: "center",
    },
    cardBody: { padding: 18, flex: 1, display: "flex", flexDirection: "column", gap: 8 },
    brand: { fontSize: 13, color: "#3b82f6", fontWeight: 500 },
    prodName: { fontSize: 16, fontWeight: 800, color: "#0f172a", lineHeight: 1.35, minHeight: 64 },
    prodDesc: { fontSize: 13, color: "#334155", lineHeight: 1.45, flex: 1 },
    price: { fontSize: 17, fontWeight: 800, color: "#3b82f6" },
    cardActions: { display: "flex", gap: 10, padding: "0 18px 18px" },
    btnCart: {
        width: 72, height: 42, border: "2px solid #3b82f6",
        borderRadius: 12, background: "#fff", color: "#3b82f6",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    },
    btnDetail: {
        flex: 1, height: 42, background: "#3b82f6",
        border: "none", borderRadius: 12, color: "#fff",
        fontSize: 15, fontWeight: 700, cursor: "pointer",
    },
};

export default function Product() {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [priceOrder, setPriceOrder] = useState("none");
    const [nameOrder, setNameOrder] = useState("none");
    const navigate = useNavigate();


    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const rows = await fetchProducts();

                const mapped = rows.map((p) => {
                    const priceNumber = Number(p.Price) || 0;
                    return {
                        id: p.ProductID,
                        name: p.ProductName,
                        brand: p.Brand || "Không xác định",
                        desc: p.Description || "Đang cập nhật thông tin sản phẩm.",
                        price: priceNumber.toLocaleString("vi-VN") + " ₫",
                        priceNumber,
                        stockQuantity: p.StockQuantity,
                        image: p.ImageURL,
                    };
                });

                setProducts(mapped);
                setError("");
            } catch (e) {
                setError(e.message || "Không tải được danh sách sản phẩm");
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

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

    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
    );

    const displayedProducts = [...filtered].sort((a, b) => {
        if (priceOrder === "asc" && a.priceNumber !== b.priceNumber) {
            return a.priceNumber - b.priceNumber;
        }
        if (priceOrder === "desc" && a.priceNumber !== b.priceNumber) {
            return b.priceNumber - a.priceNumber;
        }
        if (nameOrder === "az") return a.name.localeCompare(b.name, "vi");
        if (nameOrder === "za") return b.name.localeCompare(a.name, "vi");
        return 0;
    });

    return (
        <div>
            <Navbar />
            <div style={styles.page}>
                <div style={styles.container}>
                <h1 style={styles.title}>Thuốc nha khoa</h1>
                <p style={styles.subtitle}>Các loại thuốc và dược phẩm chuyên dụng cho nha khoa</p>
                {loading && <p className="text-muted mb-2">Đang tải sản phẩm...</p>}
                {error && <p style={{ color: "#dc2626", marginBottom: 8 }}>{error}</p>}
                <div style={styles.searchFilterRow}>
                    <input
                        style={styles.searchInput}
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc thương hiệu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        style={styles.filterSelect}
                        value={priceOrder}
                        onChange={(e) => setPriceOrder(e.target.value)}
                    >
                        <option value="none">Giá (mặc định)</option>
                        <option value="asc">Giá thấp đến cao</option>
                        <option value="desc">Giá cao đến thấp</option>
                    </select>
                    <select
                        style={styles.filterSelect}
                        value={nameOrder}
                        onChange={(e) => setNameOrder(e.target.value)}
                    >
                        <option value="none">Tên (mặc định)</option>
                        <option value="az">Tên A - Z</option>
                        <option value="za">Tên Z - A</option>
                    </select>
                </div>

                <div style={styles.grid}>
                    {displayedProducts.map((p) => (
                        <div key={p.id} style={styles.card}>
                            <div style={styles.cardImg}>
                                <Package size={58} color="#9ca3af" />
                            </div>
                            <div style={styles.cardBody}>
                                <div style={styles.brand}>{p.brand}</div>
                                <div style={styles.prodName}>
                                    <Link
                                        to={`/product-detail/${p.id}`}
                                        style={{ textDecoration: 'none', color: '#111' }} // Bỏ gạch chân mặc định của thẻ a
                                    >
                                        {p.name}
                                    </Link>
                                </div>
                                <div style={styles.prodDesc}>{p.desc}</div>
                                <div style={styles.price}>{p.price}</div>
                            </div>
                            <div style={styles.cardActions}>
                                <button style={styles.btnCart} onClick={() => handleAddToCart(p)}>
                                    <ShoppingCart size={20} />
                                </button>
                                <button style={styles.btnDetail} onClick={() => handleBuyNow(p)}>
                                    Mua Ngay
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                </div>
            </div>
            <Footer/>
        </div>

    );
}
