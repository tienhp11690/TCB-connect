import Link from 'next/link';

export default function Home() {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', textAlign: 'center' }}>
      <div className="glass card" style={{ padding: '4rem 2rem', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Office Connect
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.8 }}>
          Connect with your colleagues, organize activities, and make every workday more fun.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/auth/login" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
            Login
          </Link>
          <Link href="/auth/register" className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
            Join Now
          </Link>
        </div>
      </div>
    </div>
  );
}
