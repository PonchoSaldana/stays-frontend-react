import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle, XCircle, File, Loader2 } from 'lucide-react';

export default function FileUploader({ id, label, status, onUpload, disabled }) {

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(id, e.target.files[0]);
        }
    };

    // MODO DEMO: Click en el contenedor para simular subida si no está deshabilitado
    const handleDemoClick = () => {
        if (!disabled && (!status || status === 'error')) {
            // Simulate a file object
            const demoFile = { name: "documento_demo.pdf", size: 1024 * 500 };
            onUpload(id, demoFile);
        }
    };

    return (
        <div
            className={`uploader-card ${status || ''} ${disabled ? 'disabled' : ''}`}
            style={{ opacity: disabled ? 0.5 : 1, cursor: !disabled ? 'pointer' : 'default' }}
            onClick={handleDemoClick}
            title="Modo Demo: Click para simular carga"
        >
            <div className="file-status-icon">
                {status === 'success' ? <CheckCircle size={20} /> :
                    status === 'error' ? <XCircle size={20} /> :
                        status === 'uploading' ? <Loader2 size={20} className="animate-spin" /> :
                            <File size={20} />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 500, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    {status === 'success' ? 'Cargado correctamente' :
                        status === 'error' ? 'Error en archivo' :
                            status === 'uploading' ? 'Subiendo...' :
                                'PDF, JPG o PNG (Max 5MB)'}
                </p>
            </div>

            {status !== 'success' && status !== 'uploading' && (
                <label style={{ cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>
                    <input type="file" style={{ display: 'none' }} onChange={handleFileChange} disabled={disabled} />
                    <div className="upload-btn">
                        <UploadCloud size={18} />
                    </div>
                </label>
            )}
        </div>
    );
}
