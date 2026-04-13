// ProductDetail.js
import { ShoppingCart, ArrowLeft, Star, Shield, Truck, RotateCcw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const products = [
    { id: 1, brand: "Pymepharco", name: "Thuốc giảm đau răng Ibuprofen 400mg", desc: "Thuốc giảm đau, hạ sốt hiệu quả cho các trường hợp đau răng cấp tính", price: "45.000 ₫", rating: 4.5, reviews: 128, detail: "Ibuprofen 400mg là thuốc chống viêm không steroid (NSAID) giúp giảm đau, hạ sốt và chống viêm hiệu quả. Thường được dùng để giảm đau răng, đau đầu, đau cơ và các cơn đau nhẹ đến vừa.", usage: "Uống 1 viên mỗi 6-8 giờ sau khi ăn. Không dùng quá 3 viên/ngày.", ingredients: "Ibuprofen 400mg, tá dược vừa đủ.", warning: "Không dùng cho người mẫn cảm với Ibuprofen, phụ nữ có thai 3 tháng cuối, người loét dạ dày." },
    { id: 2, brand: "Unique", name: "Gel bôi nướu Metrogyl Denta", desc: "Gel kháng khuẩn điều trị viêm nướu, viêm quanh răng", price: "65.000 ₫", rating: 4.2, reviews: 85, detail: "Metrogyl Denta là gel kháng khuẩn kết hợp Metronidazole và Chlorhexidine, giúp điều trị viêm nướu, viêm lợi và các bệnh lý nha chu hiệu quả.", usage: "Bôi một lượng nhỏ gel lên vùng nướu bị viêm 2-3 lần/ngày sau khi đánh răng.", ingredients: "Metronidazole 1%, Chlorhexidine Gluconate 0.25%, tá dược gel.", warning: "Không dùng cho trẻ em dưới 6 tuổi. Tránh nuốt gel." },
    { id: 3, brand: "Domesco", name: "Thuốc kháng sinh Amoxicillin 500mg", desc: "Kháng sinh điều trị nhiễm trùng răng miệng, áp xe răng", price: "55.000 ₫", rating: 4.7, reviews: 210, detail: "Amoxicillin 500mg là kháng sinh nhóm penicillin phổ rộng, được chỉ định điều trị các nhiễm khuẩn răng miệng, áp xe răng, viêm mô tế bào vùng hàm mặt.", usage: "Uống 1 viên mỗi 8 giờ, trong 5-7 ngày hoặc theo chỉ định bác sĩ.", ingredients: "Amoxicillin trihydrate tương đương Amoxicillin 500mg.", warning: "Cần có đơn bác sĩ. Không dùng nếu dị ứng penicillin." },
    { id: 4, brand: "Corsodyl", name: "Nước súc miệng Chlorhexidine 0.2%", desc: "Dung dịch sát khuẩn chuyên dụng sau phẫu thuật nha khoa", price: "85.000 ₫", rating: 4.3, reviews: 67, detail: "Nước súc miệng Chlorhexidine 0.2% có tác dụng sát khuẩn mạnh, ức chế sự phát triển của vi khuẩn trong khoang miệng, thường dùng sau phẫu thuật nha khoa.", usage: "Súc miệng 10ml trong 1 phút, 2 lần/ngày. Không nuốt.", ingredients: "Chlorhexidine Digluconate 0.2%, tá dược.", warning: "Có thể gây ố vàng răng nếu dùng dài ngày. Không dùng quá 4 tuần liên tục." },
    { id: 5, brand: "Septodont", name: "Thuốc tê Lidocaine 2%", desc: "Thuốc tê tại chỗ dùng trong các thủ thuật nha khoa", price: "120.000 ₫", rating: 4.8, reviews: 342, detail: "Lidocaine 2% là thuốc gây tê tại chỗ được sử dụng rộng rãi trong nha khoa để gây tê cục bộ trước các thủ thuật nhổ răng, trám răng, phẫu thuật nha chu.", usage: "Chỉ dùng bởi bác sĩ nha khoa có chuyên môn. Tiêm tại chỗ cần tê.", ingredients: "Lidocaine HCl 2%, Epinephrine 1:80.000, tá dược.", warning: "Chỉ dành cho chuyên gia y tế. Không tự ý sử dụng." },
    { id: 6, brand: "Strepsils", name: "Viên ngậm ho Strepsils", desc: "Viên ngậm kháng khuẩn, giảm đau họng và viêm họng", price: "35.000 ₫", rating: 4.1, reviews: 156, detail: "Strepsils chứa hai hoạt chất kháng khuẩn Amylmetacresol và 2,4-Dichlorobenzyl alcohol, giúp tiêu diệt vi khuẩn gây đau họng, viêm họng.", usage: "Ngậm 1 viên mỗi 2-3 giờ, tối đa 8 viên/ngày.", ingredients: "Amylmetacresol 0.6mg, 2,4-Dichlorobenzyl alcohol 1.2mg.", warning: "Không dùng cho trẻ em dưới 6 tuổi." },
    { id: 7, brand: "Calcium-D", name: "Thuốc bổ sung Canxi + Vitamin D3", desc: "Bổ sung canxi giúp răng chắc khỏe, ngăn ngừa loãng xương hàm", price: "150.000 ₫", rating: 4.4, reviews: 98, detail: "Viên uống bổ sung Canxi và Vitamin D3 giúp tăng cường độ chắc khỏe của răng và xương hàm, ngăn ngừa tình trạng loãng xương và sâu răng do thiếu canxi.", usage: "Uống 1-2 viên/ngày sau bữa ăn.", ingredients: "Calcium Carbonate 500mg (tương đương Calcium 200mg), Vitamin D3 200IU.", warning: "Không dùng quá liều khuyến cáo. Tham khảo bác sĩ nếu đang dùng thuốc khác." },
    { id: 8, brand: "Orajel", name: "Gel điều trị loét miệng Orajel", desc: "Gel giảm đau và chữa lành vết loét miệng nhanh chóng", price: "75.000 ₫", rating: 4.6, reviews: 203, detail: "Orajel chứa Benzocaine giúp gây tê tại chỗ tức thì, giảm đau nhanh do loét miệng, nhiệt miệng. Đồng thời tạo màng bảo vệ vết loét, thúc đẩy lành thương.", usage: "Bôi một lượng nhỏ lên vết loét 4 lần/ngày hoặc khi cần.", ingredients: "Benzocaine 20%, tá dược gel.", warning: "Không dùng cho trẻ dưới 2 tuổi. Không nuốt." },
];

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
    const product = products.find((p) => p.id === parseInt(id));

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

    return (
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

                        <StarRating rating={product.rating} />
                        <div className="text-muted mb-3 mt-1" style={{ fontSize: 12 }}>{product.reviews} đánh giá</div>

                        <p className="text-muted mb-3" style={{ fontSize: 14, lineHeight: 1.7 }}>{product.desc}</p>

                        <div className="fw-bold mb-4" style={{ fontSize: 24, color: "#1DA0E0" }}>{product.price}</div>

                        <div className="d-flex gap-2 mb-4">
                            <button
                                className="btn d-flex align-items-center justify-content-center"
                                style={{ width: 48, height: 44, border: "1.5px solid #1DA0E0", borderRadius: 10, color: "#1DA0E0" }}
                            >
                                <ShoppingCart size={18} />
                            </button>
                            <button
                                className="btn flex-grow-1 fw-semibold"
                                style={{ height: 44, background: "#1DA0E0", color: "#fff", borderRadius: 10, fontSize: 14 }}
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
                    { title: "Mô tả chi tiết", content: product.detail },
                    { title: "Cách dùng", content: product.usage },
                    { title: "Thành phần", content: product.ingredients },
                    { title: "Cảnh báo", content: product.warning },
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
    );
}