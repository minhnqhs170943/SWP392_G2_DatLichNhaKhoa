import { ArrowLeft, Shield, Clock3, BadgeCheck, Mail, Phone, Briefcase, Activity } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { fetchDoctorById } from "../../services/doctorApi";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .doctor-detail-wrap * {
    font-family: 'DM Sans', sans-serif;
  }

  .doctor-detail-wrap h2 {
    font-family: 'Playfair Display', serif;
  }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .anim-1 { animation: fadeSlideUp 0.5s 0.05s ease both; }
  .anim-2 { animation: fadeSlideUp 0.5s 0.15s ease both; }
  .anim-3 { animation: fadeSlideUp 0.5s 0.25s ease both; }
  .anim-4 { animation: fadeSlideUp 0.5s 0.30s ease both; }
  .anim-5 { animation: fadeSlideUp 0.5s 0.35s ease both; }
  .anim-6 { animation: fadeSlideUp 0.5s 0.40s ease both; }

  .doctor-img-wrap img {
    transition: transform 0.5s ease;
  }
  .doctor-img-wrap:hover img {
    transform: scale(1.04);
  }

  .badge-pill {
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }
  .badge-pill:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(29,160,224,0.18);
  }

  .info-card {
    transition: box-shadow 0.25s ease, transform 0.25s ease;
    border-radius: 14px !important;
  }
  .info-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
  }

  .back-btn {
    transition: color 0.2s;
    font-size: 13px;
    letter-spacing: 0.02em;
  }
  .back-btn:hover {
    color: #1DA0E0 !important;
  }

  .info-label {
    font-size: 11px;
    color: #1DA0E0;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 3px;
  }

  .info-value {
    font-size: 15px;
    font-weight: 500;
    color: #1a1a2e;
    letter-spacing: -0.01em;
  }

  .info-icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #e8f4fd, #d0eafb);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
`;

export default function DoctorDetail() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [doctor, setDoctor] = useState(null);

    useEffect(() => {
        const loadDoctors = async () => {
            try {
                setLoading(true);
                const row = await fetchDoctorById(id);
                const d = {
                    id: row.UserID,
                    name: row.FullName,
                    phone: row.Phone,
                    email: row.Email,
                    address: row.Address,
                    avt: row.AvatarURL,
                    active: row.IsActive,
                    specialy: row.Specialty,
                    exp: row.ExperienceYears,
                    bio: row.Bio,
                    des: row.Description
                };
                setDoctor(d);
                setError("");
            } catch (e) {
                setError(e.message || "Không tải được danh sách bác sĩ");
            } finally {
                setLoading(false);
            }
        };
        loadDoctors();
    }, []);

    const navigate = useNavigate();

    if (!doctor) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <h4 className="fw-bold mb-2">Không tìm thấy bác sĩ</h4>
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>Quay lại</button>
                </div>
            </div>
        );
    }

    const infoItems = [
        {
            icon: <Mail size={16} color="#1DA0E0" />,
            label: "Email",
            value: doctor.email || "Đang cập nhật"
        },
        {
            icon: <Phone size={16} color="#1DA0E0" />,
            label: "Số Điện Thoại",
            value: doctor.phone || "Đang cập nhật"
        },
        {
            icon: <Briefcase size={16} color="#1DA0E0" />,
            label: "Năm Kinh Nghiệm",
            value: doctor.exp ? `${doctor.exp} năm kinh nghiệm` : "Đang cập nhật"
        },
        {
            icon: <Activity size={16} color="#1DA0E0" />,
            label: "Trạng Thái",
            value: doctor.active ? "🟢 Đang hoạt động" : "🔴 Không hoạt động"
        },
    ];

    return (
        <div className="doctor-detail-wrap">
            <style>{styles}</style>
            <Navbar />
            <div className="min-vh-100 py-4 px-4" style={{ background: "#f5f6fa", paddingTop: "90px" }}>

                {/* Back button */}
                <button
                    className="btn back-btn d-flex align-items-center gap-2 mb-4 text-muted"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={16} /> Quay lại
                </button>

                {/* Top row */}
                <div className="row g-4 align-items-stretch">

                    {/* Avatar */}
                    <div className="col-md-5 d-flex anim-1">
                        <div
                            className="doctor-img-wrap card border w-100"
                            style={{
                                minHeight: 420,
                                borderRadius: 16,
                                borderColor: "#eee",
                                background: "#f0f2f5",
                                overflow: "hidden",
                                position: "relative"
                            }}
                        >
                            <img
                                src={doctor.avt || "https://via.placeholder.com/420x460?text=Doctor"}
                                alt={doctor.name || "Doctor"}
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    objectPosition: "center 20%"
                                }}
                            />
                        </div>
                    </div>

                    {/* Info card */}
                    <div className="col-md-7 d-flex anim-2">
                        <div className="card border p-4 h-100 w-100" style={{ borderRadius: 16, borderColor: "#eee" }}>

                            <h2 className="fw-bold mb-2" style={{ fontSize: 26, color: "#1a1a2e", letterSpacing: "-0.02em" }}>
                                {doctor.name}
                            </h2>

                            <div
                                className="mb-3"
                                style={{
                                    display: "inline-block",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "#0f766e",
                                    background: "#ccfbf1",
                                    border: "1px solid #99f6e4",
                                    borderRadius: 10,
                                    padding: "6px 12px",
                                    letterSpacing: "0.03em"
                                }}
                            >
                                Mã bác sĩ: #{doctor.id}
                            </div>

                            <div style={{ fontSize: 11, color: "#1DA0E0", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }} className="mb-2">
                                {doctor.specialy ? `Chuyên Khoa ${doctor.specialy}` : "Đang cập nhật"}
                            </div>

                            <p style={{ fontSize: 14, lineHeight: 1.8, color: "#64748b", fontWeight: 300 }} className="mb-2">
                                {doctor.bio || "Đang cập nhật"}
                            </p>

                            {doctor.des && (
                                <p style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-line", color: "#334155" }} className="mb-3">
                                    {doctor.des}
                                </p>
                            )}

                            {/* Badges */}
                            <div className="row g-2 mt-auto">
                                {[
                                    { icon: <BadgeCheck size={14} />, text: "Bác sĩ đã xác thực" },
                                    { icon: <Shield size={14} />, text: "Tư vấn an toàn" },
                                    { icon: <Clock3 size={14} />, text: "Linh hoạt khung giờ" },
                                ].map((item, i) => (
                                    <div key={i} className="col-4">
                                        <div
                                            className="badge-pill d-flex align-items-center gap-2 p-2 rounded"
                                            style={{ background: "#f0f7ff", fontSize: 12, color: "#1DA0E0", fontWeight: 500 }}
                                        >
                                            {item.icon} {item.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info cards */}
                <div className="row g-3 mt-1">
                    {infoItems.map((item, i) => (
                        <div key={i} className={`col-md-6 anim-${i + 3}`}>
                            <div className="info-card card border p-3" style={{ borderColor: "#eee" }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="info-icon-wrap">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div className="info-label">{item.label}</div>
                                        <div className="info-value">{item.value}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
            <Footer />
        </div>
    );
}