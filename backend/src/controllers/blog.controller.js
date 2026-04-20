const blogModel = require('../models/blog.model');

const getBlogs = async (req, res) => {
    try {
        const blogs = await blogModel.findAllBlogs();
        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách blog thành công',
            data: blogs
        });
    } catch (error) {
        console.error('Get Blogs Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const getBlogById = async (req, res) => {
    const { id } = req.params;
    try {
        const blog = await blogModel.findBlogById(parseInt(id, 10));
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy blog' });
        }

        // Tăng view count
        await blogModel.incrementViewCount(parseInt(id, 10));

        return res.status(200).json({
            success: true,
            message: 'Lấy thông tin blog thành công',
            data: blog
        });
    } catch (error) {
        console.error('Get Blog Detail Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const getBlogBySlug = async (req, res) => {
    const { slug } = req.params;
    try {
        const blog = await blogModel.findBlogBySlug(slug);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy blog' });
        }

        // Tăng view count
        await blogModel.incrementViewCount(blog.BlogID);

        return res.status(200).json({
            success: true,
            message: 'Lấy thông tin blog thành công',
            data: blog
        });
    } catch (error) {
        console.error('Get Blog By Slug Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const getBlogsForAdmin = async (req, res) => {
    try {
        const blogs = await blogModel.findAllBlogsForAdmin();
        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách blog admin thành công',
            data: blogs
        });
    } catch (error) {
        console.error('Get Admin Blogs Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const createBlog = async (req, res) => {
    try {
        const { title, slug, summary, content, thumbnailURL, authorName, category, categoryName, tags, isPublished } = req.body;
        
        if (!title || !slug || !content) {
            return res.status(400).json({ success: false, message: 'Thiếu dữ liệu bắt buộc (title, slug, content)' });
        }

        const blogId = await blogModel.createBlog({
            title: String(title).trim(),
            slug: String(slug).trim(),
            summary: summary ? String(summary).trim() : null,
            content: String(content).trim(),
            thumbnailURL: thumbnailURL ? String(thumbnailURL).trim() : null,
            authorName: authorName ? String(authorName).trim() : null,
            category: category ? String(category).trim() : null,
            categoryName: categoryName ? String(categoryName).trim() : null,
            tags: tags ? String(tags).trim() : null,
            isPublished: Boolean(isPublished)
        });

        return res.status(201).json({
            success: true,
            message: 'Tạo blog thành công',
            data: { blogId }
        });
    } catch (error) {
        console.error('Create Blog Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, slug, summary, content, thumbnailURL, authorName, category, categoryName, tags, isPublished } = req.body;
        
        if (!title || !slug || !content) {
            return res.status(400).json({ success: false, message: 'Thiếu dữ liệu bắt buộc (title, slug, content)' });
        }

        const affected = await blogModel.updateBlog(Number(id), {
            title: String(title).trim(),
            slug: String(slug).trim(),
            summary: summary ? String(summary).trim() : null,
            content: String(content).trim(),
            thumbnailURL: thumbnailURL ? String(thumbnailURL).trim() : null,
            authorName: authorName ? String(authorName).trim() : null,
            category: category ? String(category).trim() : null,
            categoryName: categoryName ? String(categoryName).trim() : null,
            tags: tags ? String(tags).trim() : null,
            isPublished: Boolean(isPublished)
        });

        if (!affected) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy blog' });
        }

        return res.status(200).json({ success: true, message: 'Cập nhật blog thành công' });
    } catch (error) {
        console.error('Update Blog Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const affected = await blogModel.deleteBlog(Number(id));
        if (!affected) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy blog' });
        }
        return res.status(200).json({ success: true, message: 'Xóa blog thành công' });
    } catch (error) {
        console.error('Delete Blog Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

module.exports = {
    getBlogs,
    getBlogById,
    getBlogBySlug,
    getBlogsForAdmin,
    createBlog,
    updateBlog,
    deleteBlog
};
