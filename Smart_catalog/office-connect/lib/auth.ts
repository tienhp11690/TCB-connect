import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = 'secret-key-change-me'; // In production, use env var
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1 week')
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });
    return payload;
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return null;
    try {
        return await decrypt(session);
    } catch (error) {
        return null;
    }
}

export async function login(userData: any) {
    // Create the session
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
    const session = await encrypt({ user: { ...userData, role: userData.role || 'user' }, expires });

    // Save the session in a cookie
    const cookieStore = await cookies();
    cookieStore.set('session', session, { expires, httpOnly: true });
}

export async function logout() {
    // Destroy the session
    const cookieStore = await cookies();
    cookieStore.set('session', '', { expires: new Date(0) });
}
