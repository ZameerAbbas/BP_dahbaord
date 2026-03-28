'use client';

import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '../../firebase';
import { LayoutContext } from '../../layout/context/layoutcontext';

const SignUpPage = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const router = useRouter();

    const [isSignup, setIsSignup] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [checked, setChecked] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig?.inputStyle === 'filled' }
    );

    const handleAuth = async () => {
        setError(null);
        setLoading(true);

        try {
            await setPersistence(auth, checked ? browserLocalPersistence : browserSessionPersistence);

            if (isSignup) {
                // 🔥 SIGN UP
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Save in DB
                await set(ref(db, `users/${user.uid}`), {
                    uid: user.uid,
                    email,
                    displayName,
                    isAdmin,
                    isAccepted: false,
                    bpUsername: '',
                    bpPassword: '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });

                console.log('User created:', user);
            } else {
                // 🔥 LOGIN
                await signInWithEmailAndPassword(auth, email, password);
            }

            router.push('/');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleAuth();
    };

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '20px', width: '400px' }}>

                    <div className="text-center mb-5">
                        <div className="text-900 text-3xl font-medium mb-3">
                            {isSignup ? 'Create Account' : 'Welcome Back'}
                        </div>
                    </div>

                    {/* Name (Signup only) */}
                    {isSignup && (
                        <>
                            <label className="block mb-2">Name</label>
                            <InputText
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full mb-3"
                            />
                        </>
                    )}

                    {/* Email */}
                    <label className="block mb-2">Email</label>
                    <InputText
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full mb-3"
                    />

                    {/* Password */}
                    <label className="block mb-2">Password</label>
                    <Password
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        toggleMask
                        className="w-full mb-3"
                        inputClassName="w-full"
                    />

                    {/* isAdmin (Signup only) */}
                    {isSignup && (
                        <div className="flex align-items-center gap-2 mb-3">
                            <Checkbox
                                checked={isAdmin}
                                onChange={(e) => setIsAdmin(e.checked ?? false)}
                            />
                            <label>Register as Admin</label>
                        </div>
                    )}

                    {/* Remember me */}
                    <div className="flex align-items-center mb-3">
                        <Checkbox
                            checked={checked}
                            onChange={(e) => setChecked(e.checked ?? false)}
                            className="mr-2"
                        />
                        <label>Remember me</label>
                    </div>

                    {error && <p className="text-red-500">{error}</p>}

                    <Button
                        label={loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Sign In'}
                        className="w-full mt-3"
                        onClick={handleAuth}
                        disabled={loading}
                    />

                    {/* Toggle */}
                    <div className="text-center mt-3">
                        <span
                            className="cursor-pointer text-blue-500"
                            onClick={() => setIsSignup(!isSignup)}
                        >
                            {isSignup
                                ? 'Already have an account? Login'
                                : 'Don’t have an account? Sign Up'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
