const { sql } = require('../config/db');

const findAllBlogs = async () => {
    const request = new sql.Request();
    const result = await request.query(`
        SELECT 
            BlogID,
            Title,
            Slug,
            Summary,
            Content,
            ThumbnailURL,
            AuthorName,
            Category,
            Tags,
            ViewCount,
            IsPublished,
            PublishedDate,
            CreatedAt,
            UpdatedAt
        FROM [dbo].[Blogs] 
        WHERE IsPublished = 1
        ORDER BY PublishedDate DESC, BlogID DESC
    `);
    return result.recordset;
};

const findBlogById = async (blogId) => {
    const request = new sql.Request();
    request.input('blogId', sql.Int, blogId);
    const result = await request.query(`
        SELECT 
            BlogID,
            Title,
            Slug,
            Summary,
            Content,
            ThumbnailURL,
            AuthorName,
            Category,
            Tags,
            ViewCount,
            IsPublished,
            PublishedDate,
            CreatedAt,
            UpdatedAt
        FROM [dbo].[Blogs]
        WHERE BlogID = @blogId
    `);
    return result.recordset[0];
};

const findBlogBySlug = async (slug) => {
    const request = new sql.Request();
    request.input('slug', sql.VarChar(500), slug);
    const result = await request.query(`
        SELECT 
            BlogID,
            Title,
            Slug,
            Summary,
            Content,
            ThumbnailURL,
            AuthorName,
            Category,
            Tags,
            ViewCount,
            IsPublished,
            PublishedDate,
            CreatedAt,
            UpdatedAt
        FROM [dbo].[Blogs]
        WHERE Slug = @slug AND IsPublished = 1
    `);
    return result.recordset[0];
};

const findAllBlogsForAdmin = async () => {
    const request = new sql.Request();
    const result = await request.query(`
        SELECT 
            BlogID,
            Title,
            Slug,
            Summary,
            Content,
            ThumbnailURL,
            AuthorName,
            Category,
            Tags,
            ViewCount,
            IsPublished,
            PublishedDate,
            CreatedAt,
            UpdatedAt
        FROM [dbo].[Blogs]
        ORDER BY CreatedAt DESC
    `);
    return result.recordset;
};

const createBlog = async ({ title, slug, summary, content, thumbnailURL, authorName, category, tags, isPublished }) => {
    const request = new sql.Request();
    request.input('title', sql.NVarChar(500), title);
    request.input('slug', sql.VarChar(500), slug);
    request.input('summary', sql.NVarChar(sql.MAX), summary || null);
    request.input('content', sql.NVarChar(sql.MAX), content);
    request.input('thumbnailURL', sql.VarChar(sql.MAX), thumbnailURL || null);
    request.input('authorName', sql.NVarChar(100), authorName || null);
    request.input('category', sql.NVarChar(100), category || null);
    request.input('tags', sql.NVarChar(255), tags || null);
    request.input('isPublished', sql.Bit, isPublished ? 1 : 0);
    request.input('publishedDate', sql.DateTime, isPublished ? new Date() : null);

    const result = await request.query(`
        INSERT INTO [dbo].[Blogs] (
            Title, Slug, Summary, Content, ThumbnailURL, 
            AuthorName, Category, Tags, ViewCount, 
            IsPublished, PublishedDate, CreatedAt, UpdatedAt
        )
        OUTPUT INSERTED.BlogID
        VALUES (
            @title, @slug, @summary, @content, @thumbnailURL,
            @authorName, @category, @tags, 0,
            @isPublished, @publishedDate, GETDATE(), GETDATE()
        )
    `);

    return result.recordset[0]?.BlogID;
};

const updateBlog = async (blogId, { title, slug, summary, content, thumbnailURL, authorName, category, tags, isPublished }) => {
    const request = new sql.Request();
    request.input('blogId', sql.Int, blogId);
    request.input('title', sql.NVarChar(500), title);
    request.input('slug', sql.VarChar(500), slug);
    request.input('summary', sql.NVarChar(sql.MAX), summary || null);
    request.input('content', sql.NVarChar(sql.MAX), content);
    request.input('thumbnailURL', sql.VarChar(sql.MAX), thumbnailURL || null);
    request.input('authorName', sql.NVarChar(100), authorName || null);
    request.input('category', sql.NVarChar(100), category || null);
    request.input('tags', sql.NVarChar(255), tags || null);
    request.input('isPublished', sql.Bit, isPublished ? 1 : 0);

    const result = await request.query(`
        UPDATE [dbo].[Blogs]
        SET
            Title = @title,
            Slug = @slug,
            Summary = @summary,
            Content = @content,
            ThumbnailURL = @thumbnailURL,
            AuthorName = @authorName,
            Category = @category,
            Tags = @tags,
            IsPublished = @isPublished,
            PublishedDate = CASE 
                WHEN @isPublished = 1 AND PublishedDate IS NULL THEN GETDATE()
                WHEN @isPublished = 0 THEN NULL
                ELSE PublishedDate
            END,
            UpdatedAt = GETDATE()
        WHERE BlogID = @blogId
    `);
    return result.rowsAffected[0] || 0;
};

const deleteBlog = async (blogId) => {
    const request = new sql.Request();
    request.input('blogId', sql.Int, blogId);
    const result = await request.query(`
        DELETE FROM [dbo].[Blogs]
        WHERE BlogID = @blogId
    `);
    return result.rowsAffected[0] || 0;
};

const incrementViewCount = async (blogId) => {
    const request = new sql.Request();
    request.input('blogId', sql.Int, blogId);
    await request.query(`
        UPDATE [dbo].[Blogs]
        SET ViewCount = ViewCount + 1
        WHERE BlogID = @blogId
    `);
};

module.exports = {
    findAllBlogs,
    findBlogById,
    findBlogBySlug,
    findAllBlogsForAdmin,
    createBlog,
    updateBlog,
    deleteBlog,
    incrementViewCount
};
