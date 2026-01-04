'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FileText, BookOpen, Search, Download, Filter, ArrowRight } from 'lucide-react';

import AppShell from '../../components/layout/AppShell';

export default function LibraryPage() {
    const { data: session } = useSession();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [readingItem, setReadingItem] = useState(null);

    useEffect(() => {
        async function fetchLibrary() {
            try {
                const res = await fetch('/api/library');
                if (res.ok) {
                    const data = await res.json();
                    setItems(data);
                }
            } catch (error) {
                console.error("Library fetch failed:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLibrary();
    }, []);

    // Filter items based on search and category
    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.author && item.author.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = [
        { value: 'all', label: 'All Resources' },
        { value: 'book', label: 'Medical Books' },
        { value: 'research', label: 'Research Papers' },
        { value: 'guideline', label: 'Clinical Guidelines' },
        { value: 'article', label: 'Health Articles' }
    ];

    const getCategoryDetails = (category) => {
        const details = {
            book: { color: 'from-blue-500 to-blue-600', textColor: '#2563EB', bg: '#EFF6FF', label: 'Book' },
            research: { color: 'from-emerald-500 to-emerald-600', textColor: '#059669', bg: '#ECFDF5', label: 'Research' },
            guideline: { color: 'from-amber-500 to-amber-600', textColor: '#D97706', bg: '#FFFBEB', label: 'Guideline' },
            article: { color: 'from-purple-500 to-purple-600', textColor: '#7C3AED', bg: '#F5F3FF', label: 'Article' }
        };
        return details[category] || details['book'];
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#3B82F6', animation: 'spin 1s linear infinite' }}></div>
                <style jsx>{` @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } `}</style>
            </div>
        );
    }

    return (
        <AppShell>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px' }}>

                {/* Header Section */}
                <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1E40AF, #3B82F6)', padding: '12px', borderRadius: '14px', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)' }}>
                        <BookOpen size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1E293B', margin: 0, letterSpacing: '-0.5px' }}>Medical Library</h1>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', margin: '4px 0 0 0' }}>Access world-class medical books, research papers, and guidelines.</p>
                    </div>
                </div>

                {/* Search Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: '24px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                    marginBottom: '30px',
                    border: '1px solid #F1F5F9'
                }}>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="text"
                                placeholder="Search titles, authors, or topics..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 14px 14px 48px',
                                    borderRadius: '14px',
                                    border: '2px solid #E2E8F0',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', overflowX: 'auto', paddingBottom: '5px' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat.value}
                                    onClick={() => setCategoryFilter(cat.value)}
                                    style={{
                                        padding: '10px 18px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: categoryFilter === cat.value ? '#1E40AF' : '#F8FAFC',
                                        color: categoryFilter === cat.value ? 'white' : '#64748B',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s',
                                        boxShadow: categoryFilter === cat.value ? '0 4px 6px rgba(30, 64, 175, 0.2)' : 'none'
                                    }}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                {filteredItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <div style={{ background: '#F1F5F9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                            <Search size={32} color="#94A3B8" />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', color: '#334155', marginBottom: '8px' }}>No resources found</h3>
                        <p style={{ color: '#64748B' }}>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    /* Book Grid */
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
                        {filteredItems.map(item => {
                            const details = getCategoryDetails(item.category);
                            return (
                                <div key={item.id} style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    border: '1px solid #F1F5F9',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative'
                                }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'; }}
                                >
                                    {/* Card Header */}
                                    <div style={{
                                        padding: '24px',
                                        background: details.bg,
                                        borderBottom: '1px solid #F1F5F9',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'start'
                                    }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            background: `linear-gradient(135deg, ${details.textColor}, ${details.textColor}88)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            boxShadow: `0 4px 6px ${details.textColor}33`
                                        }}>
                                            <FileText size={20} />
                                        </div>
                                        <span style={{
                                            padding: '4px 10px',
                                            background: 'white',
                                            color: details.textColor,
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                        }}>
                                            {details.label.toUpperCase()}
                                        </span>
                                    </div>

                                    <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{
                                            fontSize: '1.15rem',
                                            fontWeight: '700',
                                            color: '#1E293B',
                                            marginBottom: '8px',
                                            lineHeight: '1.4',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {item.title}
                                        </h3>

                                        {item.author && (
                                            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '12px', fontWeight: '500' }}>
                                                by {item.author}
                                            </p>
                                        )}

                                        {item.description && (
                                            <p style={{
                                                fontSize: '0.85rem',
                                                color: '#94A3B8',
                                                marginBottom: '20px',
                                                lineHeight: '1.6',
                                                flex: 1,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {item.description}
                                            </p>
                                        )}

                                        <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => setReadingItem(item)}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    background: '#1E40AF',
                                                    color: 'white',
                                                    borderRadius: '10px',
                                                    border: 'none',
                                                    fontWeight: '600',
                                                    fontSize: '0.85rem',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#1e3a8a'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#1E40AF'}
                                            >
                                                <BookOpen size={16} /> Read
                                            </button>

                                            <a
                                                href={item.fileUrl}
                                                download
                                                style={{
                                                    padding: '10px',
                                                    background: '#F1F5F9',
                                                    color: '#475569',
                                                    borderRadius: '10px',
                                                    border: 'none',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    textDecoration: 'none'
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#1E293B'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#475569'; }}
                                                title="Download PDF"
                                            >
                                                <Download size={18} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* PDF Reader Modal */}
            {readingItem && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', zIndex: 1000,
                    display: 'flex', flexDirection: 'column',
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        background: 'white', padding: '15px 25px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        borderBottom: '1px solid #E5E7EB'
                    }}>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <div style={{ padding: '8px', background: '#EFF6FF', borderRadius: '8px' }}>
                                <FileText size={20} color="#2563EB" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>{readingItem.title}</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7280' }}>Reading Mode</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setReadingItem(null)}
                            style={{ padding: '8px 16px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Close
                        </button>
                    </div>
                    <div style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'center' }}>
                        <iframe
                            src={readingItem.fileUrl}
                            style={{ width: '100%', maxWidth: '1000px', height: '100%', borderRadius: '12px', background: 'white', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                            title="PDF Reader"
                        />
                    </div>
                </div>
            )}
        </AppShell>
    );
}
