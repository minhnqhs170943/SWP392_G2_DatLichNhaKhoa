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
                    id: row.UserID,
                    name: row.FullName,
                    phone : row.Phone,
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
                        {console.log(doctor)}
                        <div
                            className="card border d-flex align-items-center justify-content-center"
                            style={{ height: 460, borderRadius: 16, borderColor: "#eee", background: "#f0f2f5" }}
                        >
                            <img
                                src={doctor.avt || "https://via.placeholder.com/420x460?text=Doctor"}
                                alt={doctor.name || "Doctor"}
                                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", borderRadius: 16 }}
                            />
                        </div>
                    </div>

                    <div className="col-md-7">
                        <div className="card border h-100 p-4" style={{ borderRadius: 16, borderColor: "#eee" }}>
                            
                            <h2 className="fw-bold mb-2" style={{ fontSize: 20 }}>
                                {doctor.name}
                            </h2>
                            <div
                                className="mb-2"
                                style={{
                                    display: "inline-block",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "#0f766e",
                                    background: "#ccfbf1",
                                    border: "1px solid #99f6e4",
                                    borderRadius: 10,
                                    padding: "8px 10px",
                                }}
                            >
                                Mã bác sĩ: #{doctor.id}
                            </div>

                            <div style={{ fontSize: 12, color: "#1DA0E0", fontWeight: 600 }} className="mb-1">
                               {doctor.specialy? `Chuyên Khoa ${doctor.specialy}`  : "Đang cập nhập"}
                            </div>

                            <p className="text-muted mb-3" style={{ fontSize: 14, lineHeight: 1.7 }}>
                                {doctor.bio? doctor.bio : "Đang cập nhập"}
                            </p>
                            <div>
                            <p className=" mb-3" style={{ fontSize: 14, lineHeight: 1.7 }}>
                                {doctor.des}
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
                        { title: "Email", content: doctor.email || "Đang cập nhập" },
                        { title: "Số Điện Thoại", content: doctor.phone || "Đang cập nhập" },
                        { title: "Năm Kinh Nghiệm", content: doctor.exp ? `${doctor.exp} năm` : "Đang cập nhật" },
                        { title: "Trạng thái", content: doctor.active ? " 🟢 Đang hoạt động" : " 🔴 Không hoạt động" || "Đang cập nhập" },
                    ].map((section, i) => (
                        <div key={i} className="col-md-6">
                            <div className="card border p-3" style={{ borderRadius: 12, borderColor: "#eee" }}>
                                <div className="fw-bold mb-2" style={{ fontSize: 14 }}>
                                    {section.title}
                                </div>
                                <p className=" mb-0" style={{ fontSize: 13, lineHeight: 1.7 }}>
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
