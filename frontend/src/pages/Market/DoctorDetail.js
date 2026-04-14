import { ArrowLeft, Shield, Clock3, BadgeCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { fetchDoctorById } from "../../services/doctorApi";



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
                    id: row.DoctorID,
                    name: row.FullName,
                    specialty: row.Specialty || "Nha khoa",
                    exp: row.ExperienceYears || 0,
                    active: row.IsActive,
                    bio: row.Bio || "Đang cập nhật thông tin bác sĩ.",
                    avt: row.AvatarURL || "https://via.placeholder.com/360x340?text=Doctor",
                    desc: row.Description || row.Bio || "Đang cập nhật thông tin bác sĩ.",
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
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="min-vh-100 py-4 px-4" style={{ background: "#f5f6fa", paddingTop: "90px" }}>
                <button
                    className="btn d-flex align-items-center gap-2 mb-4 text-muted"
                    style={{ fontSize: 13 }}
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={16} /> Quay lai
                </button>
                {
                    console.log(doctor)

                }
                <div className="row g-4">
                    <div className="col-md-5">
                        <div
                            className="card border d-flex align-items-center justify-content-center"
                            style={{ height: 340, borderRadius: 16, borderColor: "#eee", background: "#f0f2f5" }}
                        >
                            <img
                                src={doctor.AvatarURL || "https://via.placeholder.com/360x340?text=Doctor"}
                                alt={doctor.FullName || "Doctor"}
                                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 16 }}
                            />
                        </div>
                    </div>

                    <div className="col-md-7">
                        <div className="card border h-100 p-4" style={{ borderRadius: 16, borderColor: "#eee" }}>
                            <div style={{ fontSize: 12, color: "#1DA0E0", fontWeight: 600 }} className="mb-1">
                                {doctor.Specialty}
                            </div>
                            <h2 className="fw-bold mb-2" style={{ fontSize: 20 }}>
                                {doctor.name}
                            </h2>

                            <p className="text-muted mb-3" style={{ fontSize: 14, lineHeight: 1.7 }}>
                                {doctor.bio}
                            </p>

                            <div>
                            <p className=" mb-3" style={{ fontSize: 14, lineHeight: 1.7 }}>
                                {doctor.desc}
                            </p>
                            </div>
                            <div className="row g-2">
                                {[
                                    { icon: <BadgeCheck size={14} />, text: "Bác sĩ đã xác thực" },
                                    { icon: <Shield size={14} />, text: "Tư vấn an toàn" },
                                    { icon: <Clock3 size={14} />, text: "Linh hoạt khung giờ" },
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
                        { title: "Giới thiệu", content: doctor.desc || "Đang cập nhập" },
                        { title: "Kinh nghiệm", content: `${doctor.exp} năm`|| "Đang cập nhập" },
                        { title: "Dịch Vụ CHuyên Môn", content: doctor.specialty|| "Đang cập nhập" },
                        { title: "Trạng thái", content: doctor.active ? " 🟢 Đang hoạt động" : " 🔴 Không hoạt động" || "Đang cập nhập" },
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
