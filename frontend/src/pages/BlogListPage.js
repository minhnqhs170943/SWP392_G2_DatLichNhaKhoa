import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { fetchBlogs } from '../services/blogApi';
import '../styles/BlogList.css';

const BlogListPage = () => {
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
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const truncateText = (text, maxLength) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div>
            <Navbar />
            
            <div className="blog-list-container">
                <div className="blog-list-header">
                    <h1>Bài Viết</h1>
                    <p>Chia sẻ kiến thức và kinh nghiệm về chăm sóc răng miệng</p>
                </div>

                {loading ? (
                    <div className="blog-loading">Đang tải bài viết...</div>
                ) : blogs.length === 0 ? (
                    <div className="blog-empty">Chưa có bài viết nào</div>
                ) : (
                    <div className="blog-grid">
                        {blogs.map((blog) => (
                            <div 
                                key={blog.BlogID} 
                                className="blog-card"
                                onClick={() => navigate(`/blogs/${blog.Slug}`)}
                            >
                                {blog.ThumbnailURL && (
                                    <div className="blog-card-image">
                                        <img src={blog.ThumbnailURL} alt={blog.Title} />
                                    </div>
                                )}
                                <div className="blog-card-content">
                                    {blog.CategoryName && (
                                        <span className="blog-category">{blog.CategoryName}</span>
                                    )}
                                    <h3 className="blog-card-title">{blog.Title}</h3>
                                    {blog.Summary && (
                                        <p className="blog-card-summary">
                                            {truncateText(blog.Summary, 150)}
                                        </p>
                                    )}
                                    <div className="blog-card-meta">
                                        {blog.AuthorName && (
                                            <span className="blog-author">
                                                <i className="fas fa-user"></i> {blog.AuthorName}
                                            </span>
                                        )}
                                        <span className="blog-date">
                                            <i className="fas fa-calendar"></i> {formatDate(blog.PublishedDate)}
                                        </span>
                                        <span className="blog-views">
                                            <i className="fas fa-eye"></i> {blog.ViewCount || 0} lượt xem
                                        </span>
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

export default BlogListPage;
