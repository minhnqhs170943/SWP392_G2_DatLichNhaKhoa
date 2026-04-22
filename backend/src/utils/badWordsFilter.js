const BLACKLIST = ['từ_nóng_1', 'từ_nóng_2', 'badword', 'phản_động']; 
/**
 * Kiểm tra xem nội dung có chứa từ ngữ không phù hợp hay không
 * @param {string} text - Nội dung cần kiểm tra
 * @returns {Object} - Kết quả kiểm tra { isBad: boolean, word: string | null }
 */
const checkBadWords = (text) => {
    if (!text) return { isBad: false, word: null };
    
    const lowerText = text.toLowerCase();
    for (const word of BLACKLIST) {
        if (lowerText.includes(word.toLowerCase())) {
            return { isBad: true, word: word };
        }
    }
    return { isBad: false, word: null };
};

module.exports = { checkBadWords };