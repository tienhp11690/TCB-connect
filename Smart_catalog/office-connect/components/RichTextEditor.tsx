'use client';

import { useMemo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const ReactQuill = useMemo(
        () =>
            dynamic(() => import('react-quill-new'), {
                ssr: false,
                loading: () => <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '0.5rem', minHeight: '200px' }}>Loading editor...</div>,
            }),
        []
    );

    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    }), []);

    if (!isClient) {
        return <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '0.5rem', minHeight: '200px' }}>Loading editor...</div>;
    }

    return (
        <div style={{ marginBottom: '1rem' }}>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                placeholder={placeholder}
                style={{ backgroundColor: 'white', borderRadius: '0.5rem' }}
            />
        </div>
    );
}
