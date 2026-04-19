import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { fetchBlogs } from '../services/blogApi';

const BlogPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadBlogs = async () => {
            try {
                const data = await fetchBlogs();
                setBlogs(data);
            } catch (error) {
                console.error('Lỗi khi tải blog:', error);
            } finally {
                setLoading(false);
            }
        };
        loadBlogs();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const truncateText = (text, maxLength) => {
        if (!text) return "";
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    return (
        <div>
            <Navbar />
            
            <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '80px 20px',
                textAlign: 'center',
                color: 'white'
            }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '16px', fontWeight: 700 }}>
                    Blog & Tin Tức
                </h1>
                <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                    Cập nhật kiến thức và xu hướng chăm sóc răng miệng
                </p>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p>Đang tải blog...</p>
                    </div>
                ) : blogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p>Chưa có bài viết nào</p>
                    </div>
                ) : (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '30px'
                    }}>
                        {blogs.map((blog) => (
                            <div 
                                key={blog.BlogID}
                                onClick={() => navigate(`/blog/${blog.Slug}`)}
                                style={{
                                    background: '#fff',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                }}
                            >
                                {blog.ThumbnailURL && (
                                    <img 
                                        src={blog.ThumbnailURL} 
                                        alt={blog.Title}
                                        style={{
                                            width: '100%',
                                            height: '220px',
                                            objectFit: 'cover'
                                        }}
                                    />
                                )}
                                <div style={{ padding: '20px' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        gap: '10px', 
                                        marginBottom: '12px',
                                        fontSize: '0.85rem',
                                        color: '#64748b'
                                    }}>
                                        {blog.Category && (
                                            <span style={{
                                                background: '#e0e7ff',
                                                color: '#4f46e5',
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontWeight: 500
                                            }}>
                                                {blog.Category}
                                            </span>
                                        )}
                                        <span>👁 {blog.ViewCount || 0} lượt xem</span>
                                    </div>
                                    
                                    <h3 style={{ 
                                        fontSize: '1.4rem',
                                        marginBottom: '12px',
                                        color: '#1e293b',
                                        fontWeight: 600
                                    }}>
                                        {blog.Title}
                                    </h3>
                                    
                                    {blog.Summary && (
                                        <p style={{ 
                                            color: '#64748b',
                                            lineHeight: 1.6,
                                            marginBottom: '16px'
                                        }}>
                                            {truncateText(blog.Summary, 120)}
                                        </p>
                                    )}
                                    
                                    <div style={{ 
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '0.9rem',
                                        color: '#94a3b8'
                                    }}>
                                        <span>{blog.AuthorName || 'Admin'}</span>
                                        <span>{formatDate(blog.PublishedDate)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default BlogPage;
