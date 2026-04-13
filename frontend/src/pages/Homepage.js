import Footer from './../components/Footer';
import Header from './../components/Header';
import Navbar from './../components/Navbar';
import './../styles/Homepage.css';

const HomePage = () => {
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

    const services = [
        {
            name: 'Niềng Răng Thẩm Mỹ',
            desc: 'Khắc phục triệt để các khuyết điểm về răng miệng, mang lại nụ cười tự tin và cấu trúc hàm chuẩn.',
            image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=200&fit=crop',
        },
        {
            name: 'Bọc Răng Sứ',
            desc: 'Phục hình răng hư tổn bằng chất liệu sứ cao cấp, đảm bảo tính thẩm mỹ và độ bền như răng thật.',
            image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&h=200&fit=crop',
        },
        {
            name: 'Cấy Ghép Implant',
            desc: 'Giải pháp hoàn hảo nhất hiện nay để thay thế răng đã mất, đảm bảo khả năng ăn nhai chắc chắn trọn đời.',
            image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=400&h=200&fit=crop',
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
                    <div className="row g-4">
                        {services.map((service, index) => (
                            <div key={index} className="col-lg-4 col-md-6">
                                <div className="service-card">
                                    <img src={service.image} alt={service.name} className="service-image" />
                                    <div className="service-content">
                                        <h3 className="service-name">{service.name}</h3>
                                        <p className="service-desc">{service.desc}</p>
                                        <button className="btn-book">Đặt lịch ngay</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section section-light">
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

            <section className="section">
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