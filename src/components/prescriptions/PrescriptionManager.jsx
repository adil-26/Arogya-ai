'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, File, Trash2, Eye, Plus, Calendar, User, X, FileText, Image, Loader2 } from 'lucide-react';
import './PrescriptionManager.css';

const PrescriptionManager = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [previewItem, setPreviewItem] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        doctorName: '',
        description: '',
        issuedDate: new Date().toISOString().split('T')[0],
        file: null
    });

    // Fetch prescriptions
    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            const res = await fetch('/api/prescriptions');
            if (res.ok) {
                const data = await res.json();
                setPrescriptions(data.prescriptions || []);
            }
        } catch (error) {
            console.error('Failed to fetch prescriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                alert('Please upload a PDF or image file (JPG, PNG)');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size should be less than 5MB');
                return;
            }
            setFormData({ ...formData, file });
        }
    };

    const handleUpload = async () => {
        if (!formData.title || !formData.file) {
            alert('Please provide a title and select a file');
            return;
        }

        setUploading(true);
        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Data = e.target.result;

                const res = await fetch('/api/prescriptions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: formData.title,
                        doctorName: formData.doctorName,
                        description: formData.description,
                        issuedDate: formData.issuedDate,
                        fileData: base64Data,
                        fileType: formData.file.type.includes('pdf') ? 'pdf' : 'image',
                        fileName: formData.file.name
                    })
                });

                if (res.ok) {
                    fetchPrescriptions();
                    setShowUploadModal(false);
                    setFormData({
                        title: '',
                        doctorName: '',
                        description: '',
                        issuedDate: new Date().toISOString().split('T')[0],
                        file: null
                    });
                } else {
                    alert('Failed to upload prescription');
                }
                setUploading(false);
            };
            reader.readAsDataURL(formData.file);
        } catch (error) {
            console.error('Upload error:', error);
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this prescription?')) return;

        try {
            const res = await fetch(`/api/prescriptions?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchPrescriptions();
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    if (loading) {
        return (
            <div className="prescription-loading">
                <Loader2 size={24} className="spin" />
                <p>Loading prescriptions...</p>
            </div>
        );
    }

    return (
        <div className="prescription-manager">
            {/* Header */}
            <div className="prescription-header">
                <div>
                    <h2>My Prescriptions</h2>
                    <p className="subtitle">{prescriptions.length} prescription(s) uploaded</p>
                </div>
                <button className="btn-upload" onClick={() => setShowUploadModal(true)}>
                    <Plus size={18} />
                    <span>Upload New</span>
                </button>
            </div>

            {/* Prescriptions Grid */}
            {prescriptions.length === 0 ? (
                <div className="empty-state">
                    <FileText size={48} />
                    <h3>No prescriptions yet</h3>
                    <p>Upload your medical prescriptions for easy access</p>
                    <button className="btn-upload" onClick={() => setShowUploadModal(true)}>
                        <Plus size={16} /> Upload Prescription
                    </button>
                </div>
            ) : (
                <div className="prescriptions-grid">
                    {prescriptions.map((prescription) => (
                        <div key={prescription.id} className="prescription-card">
                            <div className="card-icon">
                                {prescription.fileType === 'pdf' ? (
                                    <File size={24} />
                                ) : (
                                    <Image size={24} />
                                )}
                            </div>
                            <div className="card-content">
                                <h4>{prescription.title}</h4>
                                {prescription.doctorName && (
                                    <p className="doctor-name">
                                        <User size={12} /> {prescription.doctorName}
                                    </p>
                                )}
                                <p className="date">
                                    <Calendar size={12} />
                                    {new Date(prescription.issuedDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="card-actions">
                                {prescription.fileData && (
                                    <button
                                        className="btn-icon view"
                                        onClick={() => setPreviewItem(prescription)}
                                        title="View"
                                    >
                                        <Eye size={16} />
                                    </button>
                                )}
                                <button
                                    className="btn-icon delete"
                                    onClick={() => handleDelete(prescription.id)}
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Upload Prescription</h3>
                            <button onClick={() => setShowUploadModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Blood Test Prescription"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Doctor Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Dr. Sharma"
                                    value={formData.doctorName}
                                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Issue Date</label>
                                <input
                                    type="date"
                                    value={formData.issuedDate}
                                    onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    placeholder="Optional notes..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="file-upload-area" onClick={() => fileInputRef.current?.click()}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    hidden
                                />
                                {formData.file ? (
                                    <div className="file-selected">
                                        <FileText size={24} />
                                        <span>{formData.file.name}</span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={32} />
                                        <p>Click to upload PDF or Image</p>
                                        <span>Max 5MB • PDF, JPG, PNG</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowUploadModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn-submit"
                                onClick={handleUpload}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 size={16} className="spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={16} />
                                        Upload
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewItem && (
                <div className="modal-overlay" onClick={() => setPreviewItem(null)}>
                    <div className="preview-modal" onClick={e => e.stopPropagation()}>
                        <div className="preview-header">
                            <h3>{previewItem.title}</h3>
                            <button onClick={() => setPreviewItem(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="preview-content">
                            {previewItem.fileType === 'pdf' ? (
                                <iframe
                                    src={previewItem.fileData}
                                    title="PDF Preview"
                                />
                            ) : (
                                <img src={previewItem.fileData} alt="Prescription" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrescriptionManager;
