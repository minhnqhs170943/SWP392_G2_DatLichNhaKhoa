const { connectDB } = require('../config/db');

const stripVietnameseTones = (text) =>
    text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');

const normalizeText = (text) =>
    stripVietnameseTones(String(text || '').toLowerCase())
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const toJoinedAlphaNumeric = (text) => normalizeText(text).replace(/\s+/g, '');

const buildFlexibleRegex = (pattern) => {
    const normalizedPattern = normalizeText(pattern).replace(/\s+/g, '');
    const chars = normalizedPattern.split('').map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(chars.join('[^a-z0-9]*'), 'i');
};

const containsProfanity = async (input) => {
    const pool = await connectDB();
    const result = await pool.request().query(`
        SELECT word FROM banned_words WHERE is_active = 1
    `);

    const regexes = result.recordset
        .map((item) => String(item.word || '').trim())
        .filter(Boolean)
        .map(buildFlexibleRegex);

    const normalized = normalizeText(String(input || ''));

    if (!normalized) return false;

    return regexes.some((regex) => regex.test(normalized));
};

module.exports = { containsProfanity };