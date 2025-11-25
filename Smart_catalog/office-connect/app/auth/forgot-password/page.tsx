'use client';

import Link from 'next/link';

export default function ForgotPasswordPage() {
    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div className="glass card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <h1 style={{ color: 'var(--primary)' }}>Reset Password</h1>
                <p style={{ marginBottom: '1.5rem' }}>
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                <input type="email" placeholder="Enter your email" disabled />

                <div style={{ padding: '1rem', background: 'rgba(255,255,0,0.1)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                    <strong>Note:</strong> This is a demo. Password recovery is simulated.
                </div>

                <Link href="/auth/login" className="btn btn-secondary" style={{ width: '100%' }}>
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
