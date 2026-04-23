import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDoctors } from '../services/doctorApi';
import { getAllServicesApi } from '../services/serviceService';
import Footer from './../components/Footer';
import Header from './../components/Header';
import Navbar from './../components/Navbar';
import './../styles/Homepage.css';

const HomePage = () => {
    const [services, setServices] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const navigate = useNavigate();

    const scrollRef = useRef(null);

    // Fetch dữ liệu từ API
    useEffect(() => {
        const fetchServices = async () => {
            const result = await getAllServicesApi();
            if (result.success) {
                setServices(result.services);
            } else {
                console.error("Lỗi khi lấy danh sách dịch vụ:", result.message);
            }
        };
        fetchServices();

        const getDoctorsList = async () => {
            try {
                const doctorList = await fetchDoctors();

                setDoctors(doctorList);
            } catch (error) {
                console.error("Lỗi khi tải danh sách bác sĩ:", error.message);
            }
        };

        getDoctorsList();
    }, []);

    useEffect(() => {
        // Tạo một bộ đếm thời gian, chạy lặp lại sau mỗi 3000ms (3 giây)
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

                // Nếu đã cuộn đến kịch bên phải (trừ hao 10px để tránh lỗi làm tròn số)
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    // Cuộn mượt mà quay trở lại đầu tiên
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    // Cuộn sang phải 1 khoảng bằng chiều rộng của 1 Card + khoảng cách Gap (320px + 24px = 344px)
                    scrollRef.current.scrollBy({ left: 344, behavior: 'smooth' });
                }
            }
        }, 3000); // Thay đổi số 3000 này nếu bạn muốn chạy nhanh hay chậm hơn

        // Cleanup function: Xóa bộ đếm khi chuyển sang trang khác để tránh lỗi rò rỉ bộ nhớ
        return () => clearInterval(interval);
    }, [services]);
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const features = [
        {
            icon: '⚡',
            title: 'Đặt lịch trực tuyến dễ dàng',
            desc: 'Chủ động lựa chọn thời gian và dịch vụ mong muốn mà không cần phải chờ đợi.',
        },
        {
            icon: '👨‍⚕️',
            title: 'Bác sĩ chuyên môn cao',
            desc: 'Đội ngũ y bác sĩ giàu kinh nghiệm, tận tâm mang lại nụ cười hoàn hảo cho bạn.',
        },
        {
            icon: '💎',
            title: 'Trang thiết bị hiện đại',
            desc: 'Áp dụng công nghệ tiên tiến nhất, đảm bảo quá trình điều trị an toàn và hiệu quả.',
        },
    ];

    const steps = [
        {
            number: '1',
            title: 'Đặt lịch hẹn',
            desc: 'Chọn dịch vụ và khung giờ bạn muốn đến khám trực tiếp trên website.',
        },
        {
            number: '2',
            title: 'Xác nhận thông tự',
            desc: 'Nhân viên y tế sẽ liên hệ để xác nhận lịch hẹn và tư vấn sơ bộ.',
        },
        {
            number: '3',
            title: 'Đến khám & Điều trị',
            desc: 'Đến phòng khám đúng giờ hẹn để được bác sĩ chuyên khoa trực tiếp thăm khám.',
        },
    ];



    return (
        <div>
            <Navbar />
            <Header />

            <section className="section">
                <div className="container">
                    <h2 className="section-title">Dịch Vụ Nổi Bật</h2>
                    <p className="section-subtitle">
                        Cung cấp đa dạng các dịch vụ chăm sóc và thẩm mỹ răng miệng chất lượng cao
                    </p>

                    <div className="services-scroll-container" ref={scrollRef}>
                        {services.length > 0 ? (
                            services.map((service) => (
                                <div key={service.ServiceID} className="service-card-wrapper">
                                    <div className="custom-service-card">
                                        <div className="custom-service-img-container">
                                            <img
                                                /* Dùng ảnh nha khoa tĩnh làm nền tảng cho đẹp thay vì báo lỗi mất ảnh */
                                                src={service.image || "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=400&q=80"}
                                                alt={service.ServiceName}
                                                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80" }}
                                            />
                                        </div>
                                        <div className="custom-service-content">
                                            <h3 className="custom-service-title">{service.ServiceName}</h3>
                                            <p className="custom-service-desc">
                                                {service.Description}
                                            </p>
                                            <div className="mt-auto">
                                                <h4 className="custom-service-price">
                                                    {formatPrice(service.Price)}
                                                </h4>
                                                <button className="btn-custom-book" onClick={() => navigate('/booking')}>
                                                    Đặt lịch ngay
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center w-100">
                                <p>Đang tải danh sách dịch vụ...</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="section section-light">
                <div className="container">
                    <h2 className="section-title">Các bác sĩ của chúng tôi</h2>
                    <p className="section-subtitle">
                        Đội ngũ bác sĩ chuyên môn cao, tận tâm mang lại nụ cười hoàn hảo cho bạn
                    </p>

                    <div className="doctors-scroll-container" ref={scrollRef}>
                        {doctors.map((doctor) => (
                            <div key={doctor.DoctorID} className="doctor-card-wrapper">
                                <div className="custom-doctor-card">
                                    <div className="doctor-avatar-container">
                                        <img
                                            src={doctor.AvatarURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(doctor.FullName) + "&background=random"}
                                            alt={doctor.FullName}
                                            onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(doctor.FullName) + "&background=random" }}
                                        />
                                    </div>
                                    <h3 className="doctor-name">{doctor.FullName}</h3>
                                    <p className="doctor-specialty">{doctor.Specialty}</p>
                                    <div className="doctor-exp">Kinh nghiệm: {doctor.ExperienceYears} năm</div>
                                    <p className="doctor-bio">{doctor.Bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <h2 className="section-title">Tại sao chọn Nha Khoa SMILE SYNC</h2>
                    <p className="section-subtitle">
                        Chúng tôi cam kết mang lại trải nghiệm điều trị an toàn, chuyên nghiệp và hiệu quả nhất
                    </p>
                    <div className="row g-4">
                        {features.map((feature, index) => (
                            <div key={index} className="col-lg-4 col-md-6">
                                <div className="feature-card">
                                    <div className="feature-icon">{feature.icon}</div>
                                    <h3 className="feature-title">{feature.title}</h3>
                                    <p className="feature-desc">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section section-light">
                <div className="container">
                    <h2 className="section-title">Quy trình khám bệnh</h2>
                    <p className="section-subtitle">
                        Chuyên nghiệp, minh bạch và tiết kiệm thời gian cho khách hàng
                    </p>
                    <div className="row">
                        {steps.map((step, index) => (
                            <div key={index} className="col-lg-4 col-md-6">
                                <div className="step-card">
                                    <div className="step-number">{step.number}</div>
                                    <h3 className="step-title">{step.title}</h3>
                                    <p className="step-desc">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HomePage;