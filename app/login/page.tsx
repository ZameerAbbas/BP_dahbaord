'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '../../firebase';
import Link from 'next/link';

const LoginPage = () => {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [checked, setChecked] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden'
    );

    const handleLogin = async () => {
        setError(null);
        setLoading(true);

        try {

            await setPersistence(auth, checked ? browserLocalPersistence : browserSessionPersistence);


            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log('Logged in user:', user);


            router.push('/');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };


    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <img
                    src="/layout/images/logo-dark.svg"
                    alt="Sakai logo"
                    className="mb-5 w-6rem flex-shrink-0"
                />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <img src="/demo/images/login/avatar.png" alt="Avatar" height="50" className="mb-3" />
                            <div className="text-900 text-3xl font-medium mb-3">Welcome Back!</div>
                            <span className="text-600 font-medium">Sign in to continue</span>
                        </div>

                        <div>
                            <label htmlFor="email1" className="block text-900 text-xl font-medium mb-2">
                                Email
                            </label>
                            <InputText
                                id="email1"
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full md:w-30rem mb-5"
                                style={{ padding: '1rem' }}
                            />

                            <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">
                                Password
                            </label>
                            <Password
                                inputId="password1"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Password"
                                toggleMask
                                className="w-full mb-5"
                                inputClassName="w-full p-3 md:w-30rem"
                            />

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                <div className="flex align-items-center">
                                    <Checkbox
                                        inputId="rememberme1"
                                        checked={checked}
                                        onChange={(e) => setChecked(e.checked ?? false)}
                                        className="mr-2"
                                    />
                                    <label htmlFor="rememberme1">Remember me</label>
                                </div>
                                <a
                                    className="font-medium no-underline ml-2 text-right cursor-pointer"
                                    style={{ color: 'var(--primary-color)' }}
                                >
                                    Forgot password?
                                </a>
                            </div>

                            {error && <p className="text-red-500 mb-3">{error}</p>}

                            <Button
                                label={loading ? 'Signing in...' : 'Sign In'}
                                className="w-full p-3 text-xl"
                                onClick={handleLogin}
                                disabled={loading}
                            />
                            <div className="text-center mt-3">
                                <Link href="singup" className="text-blue-500 font-medium">
                                    Don’t have an account? Sign Up
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
