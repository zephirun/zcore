import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import * as api from '../../services/api';

// Standard SVG Icons
const IconPlus = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const IconChevronLeft = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const IconChevronRight = ({ color }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const IconMessage = ({ color, size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);
const IconCalendar = ({ color }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const IconSend = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
const IconClose = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const IconTrash = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
const IconImage = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);
const IconHeart = ({ filled, color = "currentColor", size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
);
const IconBarChart = ({ color = "currentColor" }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
);
const IconTrophy = ({ color = "currentColor" }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1a2 2 0 0 0 2 2z"></path><path d="M16 4h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4v-6z"></path><path d="M8 4H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4V4z"></path><line x1="12" y1="4" x2="12" y2="16"></line></svg>
);
const IconCheckCircle = ({ color = "currentColor", size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);


const TeamDashboard = () => {
    const { users, name: currentUserName, username: currentUsername, activeUnit, userRole } = useData();
    const [message, setMessage] = useState('');

    // ... (existing state)



    const [recipient, setRecipient] = useState(null);
    const [agendaData, setAgendaData] = useState([]);
    const [loadingAgenda, setLoadingAgenda] = useState(true);
    const [notices, setNotices] = useState([]);
    const [loadingNotices, setLoadingNotices] = useState(true);

    // Modals
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [showFullAgenda, setShowFullAgenda] = useState(false);
    const [showCalendarView, setShowCalendarView] = useState(false);
    const [viewedImage, setViewedImage] = useState(null);

    // Notice Management
    const [newNotice, setNewNotice] = useState({ category: 'INSTITUCIONAL', title: '', color: '#E0E7FF', textColor: '#4338CA' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Agenda Management
    const [newActivity, setNewActivity] = useState({
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        title: '',
        location: ''
    });
    const [savingActivity, setSavingActivity] = useState(false);

    // Advanced Interactivity State
    const [polls, setPolls] = useState([]);
    const [votes, setVotes] = useState([]); // User's votes
    const [reactions, setReactions] = useState([]); // All reactions
    const [loadingAdvanced, setLoadingAdvanced] = useState(true);

    // Advanced Modals
    const [showPollModal, setShowPollModal] = useState(false);

    // Forms
    const [newPoll, setNewPoll] = useState({ question: '', options: [{ id: 1, text: '' }, { id: 2, text: '' }] }); // Simplified for now
    const [submitting, setSubmitting] = useState(false);

    // Date Logic Fix (Timezone safe)
    const parseDateLocal = (dateStr) => {
        if (!dateStr) return new Date();
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    };

    const formatDateBR = (dateStr) => {
        const date = parseDateLocal(dateStr);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    // Calendar state
    const [currentCalMonth, setCurrentCalMonth] = useState(new Date());

    // Load notices from DB
    const loadNotices = async () => {
        setLoadingNotices(true);
        try {
            const data = await api.fetchNotices(activeUnit);
            if (data && data.length > 0) {
                setNotices(data);
            } else {
                setNotices([
                    {
                        id: 'default',
                        category: 'SISTEMA',
                        title: `Seja bem-vindo, ${currentUserName.split(' ')[0]}! Este é o mural de avisos da equipe.`,
                        time: new Date().toISOString(),
                        color: '#F3F4F6',
                        textColor: '#1F2937',
                        author: 'Admin'
                    }
                ]);
            }
        } catch (error) {
            console.error("Error loading notices", error);
        } finally {
            setLoadingNotices(false);
        }
    };

    const loadAgenda = async () => {
        setLoadingAgenda(true);
        try {
            const activities = await api.fetchTeamActivities(activeUnit);
            if (activities && activities.length > 0) {
                const sorted = [...activities].sort((a, b) => {
                    const dateA = new Date(`${a.date}T${a.time || '00:00:00'}`);
                    const dateB = new Date(`${b.date}T${b.time || '00:00:00'}`);
                    return dateA - dateB;
                });
                setAgendaData(sorted);
            } else {
                setAgendaData([]);
            }
        } catch (error) {
            console.error("Error loading agenda", error);
        } finally {
            setLoadingAgenda(false);
        }
    };

    const handleCreateNotice = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let imageUrl = '';
            if (selectedFile) {
                const uploadRes = await api.uploadNoticeImage(selectedFile);
                if (uploadRes.success) {
                    imageUrl = uploadRes.url;
                } else {
                    alert('Erro ao fazer upload da imagem: ' + uploadRes.error);
                    setUploading(false);
                    return;
                }
            }
            const success = await api.saveNotice({
                ...newNotice,
                imageUrl,
                author: currentUserName,
                unit: activeUnit
            });
            if (success) {
                setShowNoticeModal(false);
                setNewNotice({ category: 'INSTITUCIONAL', title: '', color: '#E0E7FF', textColor: '#4338CA' });
                setSelectedFile(null);
                loadNotices();
            }
        } catch (error) {
            console.error("Error saving notice", error);
        } finally {
            setUploading(false);
        }
    };

    const handleCreateActivity = async (e) => {
        e.preventDefault();
        setSavingActivity(true);
        try {
            const success = await api.saveTeamActivity({
                ...newActivity,
                unit: activeUnit,
                status: 'active'
            });
            if (success) {
                setShowActivityModal(false);
                setNewActivity({
                    date: new Date().toISOString().split('T')[0],
                    time: '12:00',
                    title: '',
                    location: ''
                });
                loadAgenda();
            }
        } catch (error) {
            console.error("Error saving activity", error);
        } finally {
            setSavingActivity(false);
        }
    };

    const handleDeleteNotice = async (id) => {
        if (window.confirm('Deseja realmente excluir este comunicado?')) {
            try {
                const success = await api.deleteNotice(id);
                if (success) {
                    loadNotices();
                }
            } catch (error) {
                console.error("Error deleting notice", error);
            }
        }
    };

    const handleDeleteActivity = async (id) => {
        if (window.confirm('Deseja excluir este compromisso?')) {
            try {
                const success = await api.deleteTeamActivity(id);
                if (success) {
                    loadAgenda();
                }
            } catch (error) {
                console.error("Error deleting activity", error);
            }
        }
    };

    // Advanced Data Loading
    const loadAdvanced = async () => {
        setLoadingAdvanced(true);
        try {
            const reactionsData = await api.fetchNoticeReactions();
            setReactions(reactionsData);

            const pollsData = await api.fetchPolls(activeUnit);
            setPolls(pollsData.polls);
            setVotes(pollsData.votes);


        } catch (error) {
            console.error("Error loading advanced data", error);
        } finally {
            setLoadingAdvanced(false);
        }
    };

    // Handlers for Advanced Interactivity
    const handleToggleReaction = async (noticeId) => {
        try {
            const { action } = await api.toggleNoticeReaction(noticeId, currentUsername);
            if (action) {
                const newReaction = { notice_id: noticeId, user_id: currentUsername, type: 'like' };
                if (action === 'added') {
                    setReactions([...reactions, newReaction]);
                } else {
                    setReactions(reactions.filter(r => !(r.notice_id === noticeId && r.user_id === currentUsername)));
                }
            }
        } catch (error) {
            console.error("Error toggling reaction", error);
        }
    };

    const handleVote = async (pollId, optionId) => {
        try {
            const res = await api.togglePollVote(pollId, currentUsername, optionId);
            if (res.success) {
                if (res.action === 'added') {
                    setVotes([...votes, { poll_id: pollId, user_id: currentUsername, option_id: optionId }]);
                } else if (res.action === 'removed') {
                    setVotes(votes.filter(v => !(v.poll_id === pollId && v.user_id === currentUsername && v.option_id === optionId)));
                }
            } else {
                alert("Erro ao computar voto: " + res.error);
            }
        } catch (error) {
            console.error("Error voting", error);
        }
    };

    const handleCreatePoll = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const success = await api.createPoll({
                question: newPoll.question,
                options: newPoll.options.filter(o => o.text.trim() !== ''),
                created_by: currentUsername,
                unit: activeUnit,
                active: true
            });
            if (success) {
                setShowPollModal(false);
                setNewPoll({ question: '', options: [{ id: 1, text: '' }, { id: 2, text: '' }] });
                loadAdvanced();
            }
        } catch (error) {
            console.error("Error creating poll", error);
        } finally {
            setSubmitting(false);
        }
    };



    // Initial Load
    useEffect(() => {
        loadAgenda();
        loadNotices();
        loadAdvanced();
    }, [activeUnit]);

    // Format initials for users
    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return parts[0].substring(0, 2).toUpperCase();
    };

    const isUserOnline = (user) => {
        if (user.username === currentUsername) return true;
        if (!user.lastSeen) return false;
        const lastSeenDate = new Date(user.lastSeen);
        const now = new Date();
        const diffInMinutes = (now - lastSeenDate) / 1000 / 60;
        return diffInMinutes <= 2;
    };

    const sortedUsers = users
        .filter(u => u.username !== currentUsername)
        .slice(0, 10);

    const formatRelativeTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);

        if (diffInMinutes < 1) return 'Agora';
        if (diffInMinutes < 60) return `Há ${diffInMinutes} ${diffInMinutes === 1 ? 'min' : 'min'}`; // Simplified min
        if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60);
            return `Há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
        }
        return date.toLocaleDateString('pt-BR');
    };

    const handleSendMessage = () => {
        if (!message.trim()) return;
        if (!recipient) {
            alert('Por favor, selecione um destinatário primeiro clicando na foto de alguém.');
            return;
        }
        alert(`Mensagem enviada para ${recipient.name || recipient.username}: ${message}`);
        setMessage('');
    };

    // Grouping activities for Full Agenda
    const groupedActivities = agendaData.reduce((groups, activity) => {
        const date = activity.date;
        if (!groups[date]) groups[date] = [];
        groups[date].push(activity);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedActivities).sort();

    // CALENDAR GENERATION
    const renderCalendarGrid = () => {
        const year = currentCalMonth.getFullYear();
        const month = currentCalMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Fill empty days from previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} style={{ height: '80px', background: '#F8FAFC' }}></div>);
        }

        // Fill actual days
        for (let d = 1; d <= lastDate; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const activities = groupedActivities[dateStr] || [];
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            days.push(
                <div key={d} style={{
                    height: '80px', border: '1px solid var(--border-color)', position: 'relative', background: isToday ? 'var(--bg-input)' : 'var(--bg-card)', cursor: 'pointer',
                    padding: '8px', transition: 'all 0.2s ease'
                }} onClick={() => {
                    setNewActivity({ ...newActivity, date: dateStr });
                    setShowActivityModal(true);
                }}>
                    <span style={{ fontSize: '12px', fontWeight: isToday ? '900' : '600', color: isToday ? '#2563EB' : 'var(--text-muted)' }}>{d}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                        {activities.slice(0, 2).map(act => (
                            <div key={act.id} style={{ fontSize: '9px', background: '#2563EB', color: 'white', padding: '2px 4px', borderRadius: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {act.title}
                            </div>
                        ))}
                        {activities.length > 2 && (
                            <div style={{ fontSize: '9px', color: '#94A3B8', fontWeight: '700' }}>+ {activities.length - 2} mais</div>
                        )}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-main)', width: '100%' }}>

            <div style={{ flex: 1, padding: '40px 20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>

                    {/* MURAL DE COMUNICADOS */}
                    <div style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '30px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-color)', position: 'relative' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <IconMessage color="#2563EB" />
                                <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mural de Comunicados</h2>
                            </div>
                            {userRole === 'admin' && (
                                <button
                                    onClick={() => setShowNoticeModal(true)}
                                    style={{ background: '#2563EB', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <IconPlus />
                                </button>
                            )}
                        </div>

                        {loadingNotices ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>Carregando comunicados...</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '600px', overflowY: 'auto', paddingRight: '5px' }}>
                                {notices.map(notice => {
                                    const reactionCount = reactions.filter(r => r.notice_id === notice.id).length;
                                    const userLiked = reactions.some(r => r.notice_id === notice.id && r.user_id === currentUsername);

                                    return (
                                        <div key={notice.id} style={{
                                            padding: '16px',
                                            borderRadius: '20px',
                                            border: `1.5px solid ${notice.color}`,
                                            background: `${notice.color}10`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            transition: 'all 0.2s ease'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{
                                                    fontSize: '10px',
                                                    fontWeight: '800',
                                                    background: notice.color,
                                                    color: notice.textColor,
                                                    padding: '4px 10px',
                                                    borderRadius: '100px',
                                                    letterSpacing: '0.02em'
                                                }}>
                                                    {notice.category}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>
                                                        {formatRelativeTime(notice.time)}
                                                    </span>
                                                    {userRole === 'admin' && notice.id !== 'default' && (
                                                        <button
                                                            onClick={() => handleDeleteNotice(notice.id)}
                                                            style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', display: 'flex', padding: 0 }}
                                                        >
                                                            <IconTrash size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 4px 0', lineHeight: '1.4' }}>{notice.title}</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {(() => {
                                                        const authorUser = users.find(u => u.name === notice.author || u.username === notice.author);
                                                        return authorUser && authorUser.avatarUrl ? (
                                                            <img
                                                                src={authorUser.avatarUrl}
                                                                alt={notice.author}
                                                                style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }}
                                                            />
                                                        ) : null;
                                                    })()}
                                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', margin: 0 }}>Enviado por {notice.author}</p>
                                                </div>
                                            </div>

                                            {notice.imageUrl && (
                                                <div
                                                    onClick={() => setViewedImage(notice.imageUrl)}
                                                    style={{
                                                        width: '100%', maxHeight: '400px', background: 'var(--bg-input)', borderRadius: '12px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden'
                                                    }}
                                                >
                                                    <img
                                                        src={notice.imageUrl}
                                                        alt="notice"
                                                        style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain' }}
                                                    />
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '4px' }}>
                                                <button
                                                    onClick={() => handleToggleReaction(notice.id)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '6px', background: userLiked ? '#FEE2E2' : 'var(--bg-card)',
                                                        border: userLiked ? '1px solid #FECACA' : '1px solid var(--border-color)', borderRadius: '20px', padding: '6px 12px',
                                                        cursor: 'pointer', transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    <IconHeart filled={userLiked} color={userLiked ? '#EF4444' : '#94A3B8'} size={16} />
                                                    <span style={{ fontSize: '12px', fontWeight: '700', color: userLiked ? '#EF4444' : '#64748B' }}>
                                                        {reactionCount > 0 ? reactionCount : 'Curtir'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* PRÓXIMAS ATIVIDADES / AGENDA */}
                    <div style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '30px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setShowCalendarView(true)}>
                                <IconCalendar color="#2563EB" />
                                <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agenda da Equipe</h2>
                            </div>
                            <button
                                onClick={() => setShowActivityModal(true)}
                                style={{ background: '#2563EB', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
                            >
                                <IconPlus />
                            </button>
                        </div>

                        {loadingAgenda ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>Carregando agenda...</div>
                        ) : (
                            <div style={{ position: 'relative', paddingLeft: '30px' }}>
                                {agendaData.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>Nenhuma atividade agendada.</div>
                                ) : (
                                    <>
                                        <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2.5px', background: '#F1F5F9', borderRadius: '10px' }}></div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            {agendaData.slice(0, 4).map(item => (
                                                <div key={item.id} style={{ position: 'relative' }}>
                                                    <div style={{
                                                        position: 'absolute', left: '-29px', top: '6px', width: '14px', height: '14px', borderRadius: '50%',
                                                        background: item.status === 'done' ? '#22C55E' : 'var(--bg-card)',
                                                        border: item.status === 'done' ? 'none' : '2.5px solid #2563EB',
                                                        zIndex: 2, boxShadow: item.status === 'active' ? '0 0 0 4px #2563EB22' : 'none'
                                                    }}></div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div>
                                                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563EB' }}>
                                                                {formatDateBR(item.date)} • {item.time ? item.time.substring(0, 5) : '00:00'}
                                                            </span>
                                                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: item.status === 'done' ? 'var(--text-muted)' : 'var(--text-main)', margin: '4px 0 2px 0' }}>{item.title}</h3>
                                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', margin: 0 }}>{item.location}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        <button
                            onClick={() => setShowFullAgenda(true)}
                            style={{
                                width: '100%', marginTop: '30px', padding: '14px', background: '#F8FAFC', border: '1.5px solid #F1F5F9', borderRadius: '16px',
                                color: '#64748B', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#2563EB'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#F1F5F9'}
                        >
                            Ver Agenda Completa
                        </button>
                    </div>

                    {/* CHAT RÁPIDO */}
                    <div style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '30px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
                            <IconMessage color="#2563EB" />
                            <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Membros da Equipe</h2>
                        </div>

                        <div style={{ marginBottom: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <p style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selecione para conversar</p>
                                <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                                    {users.filter(u => isUserOnline(u)).length} Online
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            width: '56px', height: '56px', borderRadius: '18px', background: '#2563EB', color: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800',
                                            overflow: 'hidden'
                                        }}>
                                            {(() => {
                                                const currentUser = users.find(u => u.username === currentUsername);
                                                return currentUser && currentUser.avatarUrl ? (
                                                    <img src={currentUser.avatarUrl} alt="Eu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : getInitials(currentUserName);
                                            })()}
                                        </div>
                                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '14px', height: '14px', borderRadius: '50%', border: '2.5px solid white', background: '#22C55E' }}></div>
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)' }}>Eu</span>
                                </div>

                                {sortedUsers.map(member => {
                                    const online = isUserOnline(member);
                                    const isSelected = recipient?.username === member.username;
                                    return (
                                        <div
                                            key={member.username}
                                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: online ? 1 : 0.6 }}
                                            onClick={() => setRecipient(member)}
                                        >
                                            <div style={{ position: 'relative' }}>
                                                <div style={{
                                                    width: '56px', height: '56px', borderRadius: '18px',
                                                    background: online ? '#EDF2FF' : '#F1F5F9', color: online ? '#2563EB' : '#94A3B8',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800',
                                                    border: isSelected ? '2.5px solid #2563EB' : (online ? '1px solid #2563EB22' : 'none'),
                                                    transition: 'all 0.2s ease', overflow: 'hidden'
                                                }}>
                                                    {member.avatarUrl ? (
                                                        <img src={member.avatarUrl} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : getInitials(member.name)}
                                                </div>
                                                <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '14px', height: '14px', borderRadius: '50%', border: '2.5px solid white', background: online ? '#22C55E' : '#CBD5E1' }}></div>
                                            </div>
                                            <span style={{ fontSize: '11px', fontWeight: isSelected ? '700' : '600', color: isSelected ? '#2563EB' : (online ? 'var(--text-main)' : 'var(--text-muted)'), maxWidth: '60px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {(member.name || member.username).split(' ')[0]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ marginTop: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <p style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>
                                    {recipient ? <span>Conversando com <b style={{ color: '#2563EB' }}>{recipient.name.split(' ')[0]}</b></span> : 'Selecione um membro'}
                                </p>
                                {recipient && (
                                    <button onClick={() => setRecipient(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '10px', fontWeight: '700', cursor: 'pointer' }}>Limpar</button>
                                )}
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder={recipient ? `Diga algo para ${recipient.name.split(' ')[0]}...` : "Selecione uma foto acima..."}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={!recipient}
                                    style={{
                                        width: '100%', padding: '16px 50px 16px 20px', borderRadius: '16px', border: '1.5px solid var(--border-color)', background: 'var(--bg-input)',
                                        fontSize: '14px', outline: 'none', color: 'var(--text-main)'
                                    }}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                        background: recipient ? '#2563EB' : '#CBD5E1', color: 'white', border: 'none', borderRadius: '12px',
                                        width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: recipient ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    <IconSend />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ENQUETES (POLLS) */}
                    <div style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '30px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <IconBarChart color="#2563EB" />
                                <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enquetes</h2>
                            </div>
                            {userRole === 'admin' && (
                                <button
                                    onClick={() => setShowPollModal(true)}
                                    style={{ background: '#2563EB', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
                                >
                                    <IconPlus />
                                </button>
                            )}
                        </div>

                        {loadingAdvanced ? (
                            <div style={{ textAlign: 'center', color: '#94A3B8', padding: '20px' }}>Carregando...</div>
                        ) : polls.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px', background: 'var(--bg-input)', borderRadius: '16px' }}>
                                <p style={{ fontSize: '13px', fontWeight: '600' }}>Nenhuma enquete ativa no momento.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {polls.slice(0, 2).map(poll => {
                                    const hasUserVotedInPoll = votes.some(v => v.poll_id === poll.id && v.user_id === currentUsername);
                                    const totalVotes = votes.filter(v => v.poll_id === poll.id).length;

                                    return (
                                        <div key={poll.id} style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '20px' }}>
                                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px' }}>{poll.question}</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {poll.options.map(option => {
                                                    const optionVotes = votes.filter(v => v.poll_id === poll.id && v.option_id === option.id).length;
                                                    const percent = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                                                    const isSelected = votes.some(v => v.poll_id === poll.id && v.user_id === currentUsername && v.option_id === option.id);

                                                    return (
                                                        <div
                                                            key={option.id}
                                                            onClick={() => handleVote(poll.id, option.id)}
                                                            style={{
                                                                position: 'relative', padding: '12px 16px', borderRadius: '12px',
                                                                border: isSelected ? '1.5px solid #2563EB' : '1px solid var(--border-color)',
                                                                background: 'var(--bg-card)', cursor: 'pointer', overflow: 'hidden'
                                                            }}
                                                        >
                                                            <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: isSelected ? '#2563EB' : 'var(--text-muted)' }}>
                                                                <span>{option.text}</span>
                                                                {hasUserVotedInPoll && <span>{percent}%</span>}
                                                            </div>
                                                            {hasUserVotedInPoll && (
                                                                <div style={{
                                                                    position: 'absolute', top: 0, left: 0, bottom: 0, width: `${percent}%`,
                                                                    background: isSelected ? '#EFF6FF' : 'var(--bg-input)', zIndex: 1, transition: 'width 0.5s ease'
                                                                }}></div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {hasUserVotedInPoll && (
                                                <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600', marginTop: '12px', textAlign: 'right' }}>
                                                    {totalVotes} votos no total
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>


                </div>
            </div>
        </div>
    );
};

export default TeamDashboard;
