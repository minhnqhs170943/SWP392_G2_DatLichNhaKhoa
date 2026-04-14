import { ArrowLeft, Star, Shield, Clock3, BadgeCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

const doctors = [
    {
        id: 1,
        specialty: "Rang Ham Mat",
        name: "BS. Nguyen Van Nam",
        desc: "Chuyen dieu tri nha chu, viem loi va phuc hinh rang.",
        rating: 4.8,
        reviews: 186,
        detail: "Bac si co hon 10 nam kinh nghiem trong kham va dieu tri cac benh ly rang mieng pho bien.",
        experience: "10 nam kinh nghiem tai phong kham va benh vien chuyen khoa.",
        services: "Kham tong quat, dieu tri nha chu, tram rang, tu van cham soc rang mieng.",
        schedule: "Thu 2 - Thu 7: 08:00 - 17:00",
    },
    {
        id: 2,
        specialty: "Nieng Rang",
        name: "BS. Tran Thi Lan",
        desc: "Tu van va thuc hien nieng rang cho tre em va nguoi lon.",
        rating: 4.7,
        reviews: 154,
        detail: "Chuyen sau chinh nha va lap ke hoach dieu tri theo tung tinh trang khop can cua benh nhan.",
        experience: "8 nam trong linh vuc nieng rang va chinh nha.",
        services: "Nieng rang mac cai kim loai, su, nieng trong suot, theo doi dinh ky.",
        schedule: "Thu 2 - Chu nhat: 09:00 - 18:00",
    },
    {
        id: 3,
        specialty: "Nho Rang",
        name: "BS. Le Minh Tuan",
        desc: "Nho rang kho, rang khon va xu ly bien chung rang mieng.",
        rating: 4.6,
        reviews: 121,
        detail: "Thuc hien cac thu thuat nho rang an toan, giam dau va ho tro hoi phuc nhanh sau tieu phau.",
        experience: "9 nam phau thuat rang ham mat.",
        services: "Nho rang khon, nho rang nguc, tieu phau rang mieng.",
        schedule: "Thu 2 - Thu 7: 07:30 - 16:30",
    },
    {
        id: 4,
        specialty: "Tay Trang Rang",
        name: "BS. Pham Thu Ha",
        desc: "Tay trang rang tham my bang cong nghe den LED hien dai.",
        rating: 4.5,
        reviews: 99,
        detail: "Chuyen gia tham my rang mieng, tap trung vao tay trang va phuc hoi nu cuoi tham my.",
        experience: "7 nam kinh nghiem nha khoa tham my.",
        services: "Tay trang tai ghe, tay trang tai nha, danh bong va cham soc men rang.",
        schedule: "Thu 3 - Chu nhat: 10:00 - 19:00",
    },
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
            <span className="ms-1 text-muted" style={{ fontSize: 13 }}>
                {rating} / 5
            </span>
        </div>
    );
}

export default function DoctorDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const doctor = doctors.find((d) => d.id === parseInt(id, 10));

    if (!doctor) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <h4 className="fw-bold mb-2">Khong tim thay bac si</h4>
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>
                        Quay lai
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="min-vh-100 py-4 px-4" style={{ background: "#f5f6fa" }}>
                <button
                    className="btn d-flex align-items-center gap-2 mb-4 text-muted"
                    style={{ fontSize: 13 }}
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={16} /> Quay lai
                </button>

                <div className="row g-4">
                    <div className="col-md-5">
                        <div
                            className="card border d-flex align-items-center justify-content-center"
                            style={{ height: 340, borderRadius: 16, borderColor: "#eee", background: "#f0f2f5" }}
                        >
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 20a8 8 0 0 1 16 0" />
                            </svg>
                        </div>
                    </div>

                    <div className="col-md-7">
                        <div className="card border h-100 p-4" style={{ borderRadius: 16, borderColor: "#eee" }}>
                            <div style={{ fontSize: 12, color: "#1DA0E0", fontWeight: 600 }} className="mb-1">
                                {doctor.specialty}
                            </div>
                            <h2 className="fw-bold mb-2" style={{ fontSize: 20 }}>
                                {doctor.name}
                            </h2>

                            <StarRating rating={doctor.rating} />
                            <div className="text-muted mb-3 mt-1" style={{ fontSize: 12 }}>
                                {doctor.reviews} danh gia
                            </div>

                            <p className="text-muted mb-3" style={{ fontSize: 14, lineHeight: 1.7 }}>
                                {doctor.desc}
                            </p>

                            <div className="row g-2">
                                {[
                                    { icon: <BadgeCheck size={14} />, text: "Bac si da xac thuc" },
                                    { icon: <Shield size={14} />, text: "Tu van an toan" },
                                    { icon: <Clock3 size={14} />, text: "Linh hoat khung gio" },
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

                <div className="row g-4 mt-1">
                    {[
                        { title: "Gioi thieu", content: doctor.detail },
                        { title: "Kinh nghiem", content: doctor.experience },
                        { title: "Dich vu chuyen mon", content: doctor.services },
                        { title: "Lich lam viec", content: doctor.schedule },
                    ].map((section, i) => (
                        <div key={i} className="col-md-6">
                            <div className="card border p-3" style={{ borderRadius: 12, borderColor: "#eee" }}>
                                <div className="fw-bold mb-2" style={{ fontSize: 14 }}>
                                    {section.title}
                                </div>
                                <p className="text-muted mb-0" style={{ fontSize: 13, lineHeight: 1.7 }}>
                                    {section.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>

    );
}
