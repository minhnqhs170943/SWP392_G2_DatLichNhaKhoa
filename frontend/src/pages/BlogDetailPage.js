import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { fetchBlogBySlug } from '../services/blogApi';
import '../styles/BlogDetail.css';

const BlogDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBlog = async () => {
            try {
                const data = await fetchBlogBySlug(slug);
                setBlog(data);
            } catch (error) {
                console.error('Lỗi khi tải blog:', error);
            } finally {
                setLoading(false);
            }
        };
        loadBlog();
    }, [slug]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="blog-detail-loading">Đang tải bài viết...</div>
                <Footer />
            </div>
        );
    }

    if (!blog) {
        return (
            <div>
                <Navbar />
                <div className="blog-detail-error">
                    <h2>Không tìm thấy bài viết</h2>
                    <button onClick={() => navigate('/blogs')}>Quay lại danh sách</button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            
            <div className="blog-detail-container">
                <button className="blog-back-btn" onClick={() => navigate('/blogs')}>
                    <i className="fas fa-arrow-left"></i> Quay lại
                </button>

                <article className="blog-detail-article">
                    {blog.Category && (
                        <span className="blog-detail-category">{blog.Category}</span>
                    )}
                    
                    <h1 className="blog-detail-title">{blog.Title}</h1>
                    
                    <div className="blog-detail-meta">
                        {blog.AuthorName && (
                            <span className="blog-detail-author">
                                <i className="fas fa-user"></i> {blog.AuthorName}
                            </span>
                        )}
                        <span className="blog-detail-date">
                            <i className="fas fa-calendar"></i> {formatDate(blog.PublishedDate)}
                        </span>
                        <span className="blog-detail-views">
                            <i className="fas fa-eye"></i> {blog.ViewCount || 0} lượt xem
                        </span>
                    </div>

                    {blog.ThumbnailURL && (
                        <div className="blog-detail-thumbnail">
                            <img src={blog.ThumbnailURL} alt={blog.Title} />
                        </div>
                    )}

                    {blog.Summary && (
                        <div className="blog-detail-summary">
                            {blog.Summary}
                        </div>
                    )}

                    <div 
                        className="blog-detail-content"
                        dangerouslySetInnerHTML={{ __html: blog.Content }}
                    />

                    {blog.Tags && (
                        <div className="blog-detail-tags">
                            <i className="fas fa-tags"></i>
                            {blog.Tags.split(',').map((tag, index) => (
                                <span key={index} className="blog-tag">{tag.trim()}</span>
                            ))}
                        </div>
                    )}
                </article>
            </div>

            <Footer />
        </div>
    );
};

export default BlogDetailPage;
