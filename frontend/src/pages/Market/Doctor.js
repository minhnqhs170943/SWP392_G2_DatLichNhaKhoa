import { useState, useEffect } from "react";
import { UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { fetchDoctors, fetchAllServices } from "../../services/doctorApi";


function formatPrice(value) {
    const normalized = Number(String(value).replace(/[^\d.-]/g, "")) || 0;
    return normalized.toLocaleString("vi-VN") + " ₫";
}

function normalizeText(value) {
    return String(value ?? "").toLowerCase();
}

 

const styles = {
    page: { padding: "88px 56px 36px", background: "#f5f6fa", minHeight: "100vh" },
    container: { maxWidth: 1360, margin: "0 auto" },
    title: { fontSize: "clamp(28px, 2.6vw, 40px)", fontWeight: 750, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.2px" },
    subtitle: { fontSize: 15, color: "#334155", marginBottom: 18 },
    sectionTitle: {
        marginTop: 28,
        marginBottom: 14,
        fontSize: 24,
        fontWeight: 750,
        color: "#0f172a",
        letterSpacing: "-0.2px",
    },
    searchInput: {
        width: "100%",
        maxWidth: 620,
        height: 50,
        padding: "0 16px 0 44px",
        border: "1px solid #d3dae6",
        borderRadius: 14,
        fontSize: 14,
        color: "#334155",
        outline: "none",
        marginBottom: 22,
        backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23aaa' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='M21 21l-4.35-4.35'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "14px center",
        backgroundSize: 20,
    },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 },
    card: {
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 8px rgba(15,23,42,0.06)",
    },
    cardImg: {
        background: "#e5e7eb",
        height: 220,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    cardAvatar: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    infoLine: {
        fontSize: 13,
        color: "#334155",
        lineHeight: 1.45,
    },
    bioText: {
        fontSize: 13,
        color: "#1e293b",
        lineHeight: 1.5,
        flex: 1,
        marginTop: 2,
    },
    cardBody: { padding: 18, flex: 1, display: "flex", flexDirection: "column", gap: 8 },
    specialty: { fontSize: 13, color: "#3b82f6", fontWeight: 500 },
    doctorName: { fontSize: 16, fontWeight: 800, color: "#0f172a", lineHeight: 1.35 },
    doctorDesc: { fontSize: 13, color: "#334155", lineHeight: 1.45, flex: 1 },
    serviceName: { fontSize: 16, fontWeight: 800, color: "#0f172a", lineHeight: 1.35, minHeight: 44 },
    serviceDesc: { fontSize: 13, color: "#334155", lineHeight: 1.45, flex: 1 },
    cardActions: { display: "flex", gap: 10, padding: "0 18px 18px" },
    btnIcon: {
        width: 72, height: 42, border: "2px solid #3b82f6",
        borderRadius: 12, background: "#fff", color: "#3b82f6",
        display: "flex", alignItems: "center", justifyContent: "center",
    },
    btnDetail: {
        flex: 1, height: 42, background: "#3b82f6",
        border: "none", borderRadius: 12, color: "#fff",
        fontSize: 15, fontWeight: 700, display: "flex",
        alignItems: "center", justifyContent: "center", textDecoration: "none",
    },
    stateText: {
        marginBottom: 16,
        fontSize: 14,
        fontWeight: 600,
    },
    pagination: {
        marginTop: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flexWrap: "wrap",
    },
    pageBtn: {
        minWidth: 38,
        height: 38,
        borderRadius: 10,
        border: "1px solid #cbd5e1",
        background: "#fff",
        color: "#0f172a",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        padding: "0 10px",
    },
    pageBtnActive: {
        background: "#3b82f6",
        color: "#fff",
        border: "1px solid #3b82f6",
    },
    pageBtnDisabled: {
        opacity: 0.45,
        cursor: "not-allowed",
    },
};



export default function Doctor() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [doctors, setDoctors] = useState([]);
    const [services, setService] = useState([]);
    const [doctorPage, setDoctorPage] = useState(1);
    const doctorsPerPage = 6;
    const servicesLimit = 6;
    const navigate = useNavigate();


    useEffect(() => {
        const loadDoctors = async () => {
            try {
                setLoading(true);
                const rows = await fetchDoctors();

                const mapped = rows.map((d) => ({
                    id: d.UserID,
                    name: d.FullName,
                    avt: d.AvatarURL,
                    bio: d.Bio,
                    experience: d.ExperienceYears,
                    specialty: d.Specialty
                }));

                setDoctors(mapped);
                setError("");
            } catch (e) {
                setError(e.message || "Không tải được danh sách bác sĩ");
            } finally {
                setLoading(false);
            }
        };

        loadDoctors();
    }, []);

        useEffect(() => {
        const loadServices = async () => {
            try {
                setLoading(true);
                const rows = await fetchAllServices();

                const mapped = rows.map((d) => ({
                    id: d.ServiceID,
                    name: d.ServiceName,
                    price: d.Price || "Đang cập nhật giá",
                    desc: d.Description || "Đang cập nhật thông tin.",
                    active: d.IsActive,
                    img: d.ImageURL
                }));

                setService(mapped);
                setError("");
            } catch (e) {
                setError(e.message || "Không tải được danh sách bác sĩ");
            } finally {
                setLoading(false);
            }
        };

        loadServices();
    }, []);

    const keyword = normalizeText(search);
    const filtered = doctors.filter(
        (d) =>
            normalizeText(d.name).includes(keyword) ||
            normalizeText(d.specialty).includes(keyword)
    );
    const filteredServices = services.filter(
        (s) =>
            normalizeText(s.name).includes(keyword) ||
            normalizeText(s.desc).includes(keyword)
    );
    const doctorTotalPages = Math.max(1, Math.ceil(filtered.length / doctorsPerPage));
    const paginatedDoctors = filtered.slice((doctorPage - 1) * doctorsPerPage, doctorPage * doctorsPerPage);
    const visibleServices = filteredServices.slice(0, servicesLimit);

    useEffect(() => {
        setDoctorPage(1);
    }, [search]);

    useEffect(() => {
        if (doctorPage > doctorTotalPages) setDoctorPage(doctorTotalPages);
    }, [doctorPage, doctorTotalPages]);

    return (
        <div>
            <Navbar />
            <div style={styles.page}>
                <div style={styles.container}>
                    <h1 style={styles.title}>Bác Sĩ Nha Khoa</h1>
                    <p style={styles.subtitle}>Danh sách bác sĩ và dịch vụ tại phòng khám</p>
                    <input
                        style={styles.searchInput}
                        type="text"
                        placeholder="Tìm kiếm bác sĩ, dịch vụ hoặc chuyên khoa..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {loading && (
                        <div style={{ ...styles.stateText, color: "#475569" }}>Đang tải danh sách bác sĩ...</div>
                    )}
                    {!!error && (
                        <div style={{ ...styles.stateText, color: "#dc2626" }}>{error}</div>
                    )}

                    <div style={styles.grid}>
                        {paginatedDoctors.map((doctor) => (
                            <div key={doctor.id} style={styles.card}>
                                <div style={styles.cardImg}>
                                    {doctor.avt ? (
                                        <img src={doctor.avt} alt={doctor.name} style={styles.cardAvatar} />
                                    ) : (
                                        <UserRound size={58} color="#9ca3af" />
                                    )}
                                </div>
                                <div style={styles.cardBody}>
                                    <div style={styles.doctorName}>
                                        <Link to={`/doctor-detail/${doctor.id}`} style={{ textDecoration: "none", color: "#111" }}>
                                            {doctor.name}
                                        </Link>
                                    </div>
                                    <div style={styles.specialty}>{doctor.specialty}</div>
                                    <div style={styles.infoLine}>Kinh nghiệm: {doctor.experience ?? 0} năm</div>
                                    <div style={styles.bioText}>{doctor.bio || "Chưa có thông tin giới thiệu."}</div>
                                </div>
                                <div style={styles.cardActions}>
                                    <Link to={`/doctor-detail/${doctor.id}`} style={styles.btnDetail}>
                                        Chi tiết
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    {filtered.length > 0 && (
                        <div style={styles.pagination}>
                            <button
                                style={{ ...styles.pageBtn, ...(doctorPage === 1 ? styles.pageBtnDisabled : {}) }}
                                disabled={doctorPage === 1}
                                onClick={() => setDoctorPage((prev) => Math.max(1, prev - 1))}
                            >
                                Trước
                            </button>
                            {Array.from({ length: doctorTotalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    style={{ ...styles.pageBtn, ...(pageNum === doctorPage ? styles.pageBtnActive : {}) }}
                                    onClick={() => setDoctorPage(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            ))}
                            <button
                                style={{ ...styles.pageBtn, ...(doctorPage === doctorTotalPages ? styles.pageBtnDisabled : {}) }}
                                disabled={doctorPage === doctorTotalPages}
                                onClick={() => setDoctorPage((prev) => Math.min(doctorTotalPages, prev + 1))}
                            >
                                Sau
                            </button>
                        </div>
                    )}

                    <h2 style={styles.sectionTitle}>Danh sách dịch vụ</h2>
                    <div style={styles.grid}>
                        {visibleServices.map((service) => (
                            <div key={service.id} style={styles.card}>
                               
                                <div style={styles.cardImg}>
                                    {service.img ? (
                                        <img src={service.img} alt={service.name} style={styles.cardAvatar} />
                                    ) : (
                                        <UserRound size={58} color="#9ca3af" />
                                    )}
                                </div>
                                <div style={styles.cardBody}>
                                    <div style={styles.serviceName}>{service.name}</div>
                                    <div style={styles.serviceDesc}>{service.desc?service.desc: "Đang cập nhật"}</div>
                                </div>
                                <div style={styles.cardActions}>

                                    <button style={styles.btnDetail} onClick={() => navigate(`/booking`)}>
                                        {formatPrice(service.price)}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>

    );
}
