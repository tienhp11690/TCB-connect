'use client';

import { useEffect } from 'react';

interface AttachmentViewerProps {
    attachments: string[];
    currentIndex: number;
    onClose: () => void;
    onNavigate: (index: number) => void;
}

export default function AttachmentViewer({ attachments, currentIndex, onClose, onNavigate }: AttachmentViewerProps) {
    const currentFile = attachments[currentIndex];
    const isImage = currentFile?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
            if (e.key === 'ArrowRight' && currentIndex < attachments.length - 1) onNavigate(currentIndex + 1);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, attachments.length, onClose, onNavigate]);

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.9)',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'fadeIn 0.2s ease-out'
            }}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    fontSize: '24px',
                    cursor: 'pointer',
                    zIndex: 10001,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}
            >
                ×
            </button>

            {/* Previous Button */}
            {currentIndex > 0 && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(currentIndex - 1);
                    }}
                    style={{
                        position: 'absolute',
                        left: '20px',
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        fontSize: '24px',
                        cursor: 'pointer',
                        zIndex: 10001,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}
                >
                    ‹
                </button>
            )}

            {/* Next Button */}
            {currentIndex < attachments.length - 1 && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(currentIndex + 1);
                    }}
                    style={{
                        position: 'absolute',
                        right: '20px',
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        fontSize: '24px',
                        cursor: 'pointer',
                        zIndex: 10001,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}
                >
                    ›
                </button>
            )}

            {/* Content */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                }}
            >
                {isImage ? (
                    <img
                        src={currentFile}
                        alt={`Attachment ${currentIndex + 1}`}
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '80vh',
                            objectFit: 'contain',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}
                    />
                ) : (
                    <div style={{
                        background: 'white',
                        padding: '3rem',
                        borderRadius: '0.5rem',
                        textAlign: 'center',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                        <h3>{currentFile.split('/').pop()}</h3>
                        <a
                            href={currentFile}
                            download
                            style={{
                                display: 'inline-block',
                                marginTop: '1rem',
                                padding: '0.75rem 1.5rem',
                                background: 'var(--primary)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '0.5rem'
                            }}
                        >
                            Download File
                        </a>
                    </div>
                )}

                {/* File Counter */}
                <div style={{
                    background: 'rgba(255,255,255,0.9)',
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                }}>
                    {currentIndex + 1} / {attachments.length}
                </div>
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
