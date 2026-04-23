import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Trash2, Pencil, Save, X } from 'lucide-react';
import './AdminReviews.css';
import {
    fetchAdminReviews,
    deleteAdminReview,
    fetchBannedWords,
    createBannedWord,
    updateBannedWord,
    deleteBannedWord,
} from '../../services/adminReviewApi';

const MAX_WORD_LENGTH = 255;
const MAX_REASON_LENGTH = 500;

const AdminReviews = () => {
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [loadingWords, setLoadingWords] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [words, setWords] = useState([]);
    const [reviewSearch, setReviewSearch] = useState('');
    const [wordSearch, setWordSearch] = useState('');
    const [newWord, setNewWord] = useState('');
    const [newReason, setNewReason] = useState('');
    const [editingWordId, setEditingWordId] = useState(null);
    const [editingPayload, setEditingPayload] = useState({ word: '', reason: '', is_active: true });

    const loadReviews = useCallback(async () => {
        try {
            setLoadingReviews(true);
            const data = await fetchAdminReviews(reviewSearch);
            setReviews(data);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoadingReviews(false);
        }
    }, [reviewSearch]);

    const loadWords = useCallback(async () => {
        try {
            setLoadingWords(true);
            const data = await fetchBannedWords(wordSearch);
            setWords(data);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoadingWords(false);
        }
    }, [wordSearch]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    useEffect(() => {
        loadWords();
    }, [loadWords]);

    const activeWordCount = useMemo(
        () => words.filter((w) => w.is_active === true || w.is_active === 1).length,
        [words]
    );

    const handleDeleteReview = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa review này?')) return;
        try {
            await deleteAdminReview(id);
            await loadReviews();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleCreateWord = async (e) => {
        e.preventDefault();
        const word = newWord.trim();
        const reason = newReason.trim();

        if (!word) return alert('Vui lòng nhập từ cấm.');
        if (word.length > MAX_WORD_LENGTH) return alert(`Từ cấm tối đa ${MAX_WORD_LENGTH} ký tự.`);
        if (reason.length > MAX_REASON_LENGTH) return alert(`Lý do tối đa ${MAX_REASON_LENGTH} ký tự.`);

        try {
            await createBannedWord({ word, reason: reason || null });
            setNewWord('');
            setNewReason('');
            await loadWords();
        } catch (error) {
            alert(error.message);
        }
    };

    const startEditWord = (wordItem) => {
        setEditingWordId(wordItem.id);
        setEditingPayload({
            word: wordItem.word || '',
            reason: wordItem.reason || '',
            is_active: wordItem.is_active === true || wordItem.is_active === 1,
        });
    };

    const handleUpdateWord = async () => {
        if (!editingWordId) return;
        const word = editingPayload.word.trim();
        const reason = String(editingPayload.reason || '').trim();

        if (!word) return alert('Từ cấm không được để trống.');
        if (word.length > MAX_WORD_LENGTH) return alert(`Từ cấm tối đa ${MAX_WORD_LENGTH} ký tự.`);
        if (reason.length > MAX_REASON_LENGTH) return alert(`Lý do tối đa ${MAX_REASON_LENGTH} ký tự.`);

        try {
            await updateBannedWord(editingWordId, {
                word,
                reason: reason || null,
                is_active: !!editingPayload.is_active,
            });
            setEditingWordId(null);
            await loadWords();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDeleteWord = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa từ cấm này?')) return;
        try {
            await deleteBannedWord(id);
            if (editingWordId === id) setEditingWordId(null);
            await loadWords();
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="admin-reviews">
            <div className="section-card">
                <div className="section-head">
                    <div>
                        <h3 className="section-title">Quản Lý Review</h3>
                        <p className="section-subtitle">Danh sách review của người dùng, hỗ trợ tìm kiếm và xóa.</p>
                    </div>
                </div>

                <div className="toolbar">
                    <div className="input-group">
                        <span className="input-group-text"><Search size={16} /></span>
                        <input
                            value={reviewSearch}
                            onChange={(e) => setReviewSearch(e.target.value)}
                            className="form-control"
                            placeholder="Tìm theo bệnh nhân, bác sĩ, nội dung..."
                        />
                    </div>
                    <button className="btn btn-outline-primary" onClick={loadReviews}>Tìm</button>
                </div>

                {loadingReviews ? (
                    <div className="text-center p-4"><div className="spinner-border text-primary" /></div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Bệnh nhân</th>
                                    <th>Bác sĩ</th>
                                    <th>Đánh giá</th>
                                    <th>Nội dung</th>
                                    <th>Ngày tạo</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center py-4">Chưa có review.</td></tr>
                                ) : reviews.map((r, idx) => (
                                    <tr key={r.ReviewID}>
                                        <td>{idx + 1}</td>
                                        <td>{r.UserName}</td>
                                        <td>{r.DoctorName}</td>
                                        <td>{r.Rating}/5</td>
                                        <td style={{ maxWidth: 320 }}>{r.Comment}</td>
                                        <td>{new Date(r.CreatedAt).toLocaleString('vi-VN')}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteReview(r.ReviewID)}>
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="section-card">
                <div className="section-head">
                    <div>
                        <h3 className="section-title">CRUD Banned Words</h3>
                        <p className="section-subtitle">Đang active: {activeWordCount} từ cấm.</p>
                    </div>
                </div>

                <form className="word-form" onSubmit={handleCreateWord}>
                    <input
                        className="form-control"
                        placeholder="Từ cấm"
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                    />
                    <input
                        className="form-control"
                        placeholder="Lý do (không bắt buộc)"
                        value={newReason}
                        onChange={(e) => setNewReason(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary d-flex align-items-center gap-1">
                        <Plus size={15} /> Thêm
                    </button>
                </form>

                <div className="toolbar">
                    <div className="input-group">
                        <span className="input-group-text"><Search size={16} /></span>
                        <input
                            value={wordSearch}
                            onChange={(e) => setWordSearch(e.target.value)}
                            className="form-control"
                            placeholder="Tìm từ cấm..."
                        />
                    </div>
                    <button className="btn btn-outline-primary" onClick={loadWords}>Tìm</button>
                </div>

                {loadingWords ? (
                    <div className="text-center p-4"><div className="spinner-border text-primary" /></div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Từ cấm</th>
                                    <th>Lý do</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {words.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-4">Chưa có từ cấm.</td></tr>
                                ) : words.map((w, idx) => {
                                    const isEditing = editingWordId === w.id;
                                    return (
                                        <tr key={w.id}>
                                            <td>{idx + 1}</td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        className="form-control form-control-sm"
                                                        value={editingPayload.word}
                                                        onChange={(e) => setEditingPayload((prev) => ({ ...prev, word: e.target.value }))}
                                                    />
                                                ) : w.word}
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        className="form-control form-control-sm"
                                                        value={editingPayload.reason}
                                                        onChange={(e) => setEditingPayload((prev) => ({ ...prev, reason: e.target.value }))}
                                                    />
                                                ) : (w.reason || '-')}
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={editingPayload.is_active ? '1' : '0'}
                                                        onChange={(e) => setEditingPayload((prev) => ({ ...prev, is_active: e.target.value === '1' }))}
                                                    >
                                                        <option value="1">Active</option>
                                                        <option value="0">Inactive</option>
                                                    </select>
                                                ) : (
                                                    <span className={`badge ${w.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                        {w.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="d-flex gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <button className="btn btn-sm btn-success" onClick={handleUpdateWord}>
                                                            <Save size={14} />
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingWordId(null)}>
                                                            <X size={14} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className="btn btn-sm btn-outline-primary" onClick={() => startEditWord(w)}>
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteWord(w.id)}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReviews;
