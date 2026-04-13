// Product.js
import { useState } from "react";
import { ShoppingCart, FlaskConical } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { addToCart } from "../../utils/cart";


const products = [
    { id: 1, brand: "Pymepharco", name: "Thuốc giảm đau răng Ibuprofen 400mg", desc: "Thuốc giảm đau, hạ sốt hiệu quả cho các trường hợp đau răng cấp tính", price: "45.000 ₫", priceNumber: 45000 },
    { id: 2, brand: "Unique", name: "Gel bôi nướu Metrogyl Denta", desc: "Gel kháng khuẩn điều trị viêm nướu, viêm quanh răng", price: "65.000 ₫", priceNumber: 65000 },
    { id: 3, brand: "Domesco", name: "Thuốc kháng sinh Amoxicillin 500mg", desc: "Kháng sinh điều trị nhiễm trùng răng miệng, áp xe răng", price: "55.000 ₫", priceNumber: 55000 },
    { id: 4, brand: "Corsodyl", name: "Nước súc miệng Chlorhexidine 0.2%", desc: "Dung dịch sát khuẩn chuyên dụng sau phẫu thuật nha khoa", price: "85.000 ₫", priceNumber: 85000 },
    { id: 5, brand: "Septodont", name: "Thuốc tê Lidocaine 2%", desc: "Thuốc tê tại chỗ dùng trong các thủ thuật nha khoa", price: "120.000 ₫", priceNumber: 120000 },
    { id: 6, brand: "Strepsils", name: "Viên ngậm ho Strepsils", desc: "Viên ngậm kháng khuẩn, giảm đau họng và viêm họng", price: "35.000 ₫", priceNumber: 35000 },
    { id: 7, brand: "Calcium-D", name: "Thuốc bổ sung Canxi + Vitamin D3", desc: "Bổ sung canxi giúp răng chắc khỏe, ngăn ngừa loãng xương hàm", price: "150.000 ₫", priceNumber: 150000 },
    { id: 8, brand: "Orajel", name: "Gel điều trị loét miệng Orajel", desc: "Gel giảm đau và chữa lành vết loét miệng nhanh chóng", price: "75.000 ₫", priceNumber: 75000 },
];

const styles = {
    page: { padding: "32px 40px", background: "#f5f6fa", minHeight: "100vh" },
    title: { fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 4 },
    subtitle: { fontSize: 13, color: "#888", marginBottom: 20 },
    searchInput: {
        width: 280, padding: "9px 14px 9px 36px",
        border: "1px solid #ddd", borderRadius: 8,
        fontSize: 13, color: "#333", outline: "none",
        marginBottom: 28,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23aaa' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='M21 21l-4.35-4.35'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "10px center",
    },
    grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
    card: {
        background: "#fff", borderRadius: 12,
        border: "1px solid #eee", overflow: "hidden",
        display: "flex", flexDirection: "column",
    },
    cardImg: {
        background: "#f0f2f5", height: 140,
        display: "flex", alignItems: "center", justifyContent: "center",
    },
    cardBody: { padding: 14, flex: 1, display: "flex", flexDirection: "column", gap: 6 },
    brand: { fontSize: 11, color: "#1DA0E0", fontWeight: 600 },
    prodName: { fontSize: 13, fontWeight: 700, color: "#111", lineHeight: 1.4 },
    prodDesc: { fontSize: 12, color: "#888", lineHeight: 1.5, flex: 1 },
    price: { fontSize: 14, fontWeight: 700, color: "#1DA0E0" },
    cardActions: { display: "flex", gap: 8, padding: "0 14px 14px" },
    btnCart: {
        width: 40, height: 36, border: "1.5px solid #1DA0E0",
        borderRadius: 8, background: "#fff", color: "#1DA0E0",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    },
    btnBuy: {
        flex: 1, height: 36, background: "#1DA0E0",
        border: "none", borderRadius: 8, color: "#fff",
        fontSize: 13, fontWeight: 500, cursor: "pointer",
    },
};

export default function Product() {
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const handleAddToCart = (product) => {
        addToCart(product);
    };

    const handleBuyNow = (product) => {
        addToCart(product);
        navigate("/cart");
    };

    const filtered = products.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.brand.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={styles.page}>
            <h1 style={styles.title}>Thuốc nha khoa</h1>
            <p style={styles.subtitle}>Các loại thuốc và dược phẩm chuyên dụng cho nha khoa</p>
            <input
                style={styles.searchInput}
                type="text"

                placeholder="Tìm kiếm thuốc hoặc dược phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div style={styles.grid}>
                {filtered.map((p) => (
                    <div key={p.id} style={styles.card}>
                        <div style={styles.cardImg}>
                            <FlaskConical size={48} color="#ccc" />
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
                                <ShoppingCart size={15} />
                            </button>
                            <button style={styles.btnBuy} onClick={() => handleBuyNow(p)}>
                                Mua ngay
                            </button>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
