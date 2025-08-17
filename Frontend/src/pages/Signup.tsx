import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
const SignupPage = () => {
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [showCredentialsForm, setShowCredentialsForm] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [emailError, setEmailError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleEmailSignup = () => {
        setShowEmailForm(true);
    };

    const handleGoogleSignup = () => {};

    const handleBackToSignup = () => {
        setShowEmailForm(false);
        setShowOtpForm(false);
        setShowCredentialsForm(false);
        setEmail('');
        setUsername('');
        setPassword('');
        setOtp(['', '', '', '', '', '']);
        setEmailError('');
        setUsernameError('');
        setPasswordError('');
        setOtpError('');
        setSubmitError('');
    };

    const handleBackToEmail = () => {
        setShowOtpForm(false);
        setShowCredentialsForm(false);
        setOtp(['', '', '', '', '', '']);
        setOtpError('');
        setSubmitError('');
    };

    const handleBackToOtp = () => {
        setShowCredentialsForm(false);
        setOtpError('');
        setSubmitError('');
    };

    const handleRegisterSubmit = async () => {
        setEmailError('');
        setUsernameError('');
        setPasswordError('');
        setSubmitError('');

        let hasErrors = false;

        if (!email.trim()) {
            setEmailError('Email address is required');
            hasErrors = true;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setEmailError('Please enter a valid email address');
                hasErrors = true;
            }
        }

        if (!username.trim()) {
            setUsernameError('Username is required');
            hasErrors = true;
        }

        if (!password.trim()) {
            setPasswordError('Password is required');
            hasErrors = true;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            hasErrors = true;
        }

        if (hasErrors) return;

        try {
            setIsSubmitting(true);
            await apiService.register({ email, password, username });
            navigate('/login');
        } catch (err: any) {
            const message = err?.response?.data?.error || 'Failed to register. Please try again.';
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEmailSubmit = async () => {
        setEmailError('');
        setSubmitError('');
        
        if (!email.trim()) {
            setEmailError('Email address is required');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        try {
            setIsSubmitting(true);
            await apiService.sendOtp({ email });
        setShowOtpForm(true);
        } catch (err: any) {
            if (err?.code === 'ERR_CANCELED') return;
            const message = err?.response?.data?.message || err?.response?.data?.error || 'Failed to send code. Please try again.';
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length <= 1) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Auto-focus next input
            if (value && index < 5) {
                const nextInput = document.getElementById(`otp-${index + 1}`);
                nextInput?.focus();
            }
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleOtpPaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (otpError) setOtpError('');
        const pasted = e.clipboardData.getData('text');
        const digits = pasted.replace(/\D/g, '');
        if (!digits) return;
        const maxLen = 6 - index;
        const toFill = digits.slice(0, maxLen).split('');
        const newOtp = [...otp];
        for (let i = 0; i < toFill.length; i++) {
            newOtp[index + i] = toFill[i];
        }
        setOtp(newOtp);
        const nextIndex = Math.min(index + toFill.length, 5);
        const nextInput = document.getElementById(`otp-${nextIndex}`);
        nextInput?.focus();
    };

    const handleOtpSubmit = async () => {
        const otpCode = otp.join('');
        setOtpError('');
        setSubmitError('');

        if (otpCode.length !== 6) {
            setOtpError('Please enter the complete 6-digit verification code');
            return;
        }

        try {
            setIsSubmitting(true);
            await apiService.verifyOtp({ email, otp: otpCode });
            setShowOtpForm(false);
            setShowCredentialsForm(true);
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.response?.data?.error || 'Invalid or expired code. Please try again.';
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="w-full max-w-xs relative">
                {/* Main Signup Screen */}
                <div
                    className={`transition-opacity duration-300 ${showEmailForm ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                    {/* Logo */}
                    <div className="text-center mb-12">
                        <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center">
                            <svg className="w-16 h-16" viewBox="0 0 256 256" fill="none">
                                <circle cx="128" cy="128" r="120" fill="#47848F" />
                                <circle cx="128" cy="128" r="100" fill="#9FEAF9" />
                                <circle cx="128" cy="128" r="85" fill="#47848F" />
                                <circle cx="128" cy="128" r="70" fill="#9FEAF9" />
                                <circle cx="128" cy="128" r="55" fill="#47848F" />
                                <circle cx="128" cy="128" r="40" fill="#9FEAF9" />
                                <circle cx="128" cy="128" r="25" fill="#47848F" />
                            </svg>
                        </div>
                        <h1
                            className="text-lg font-medium font-satoshi"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Sign up for Astra
                        </h1>
                    </div>

                    {/* Signup Buttons */}
                    <div className="space-y-3">
                        {/* Continue with Google */}
                        <button
                            onClick={handleGoogleSignup}
                            className="w-4/5 mx-auto py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2 font-satoshi"
                            style={{
                                backgroundColor: '#6366F1',
                                color: 'white',
                                border: 'none'
                            }}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        {/* Continue with Email */}
                        <button
                            onClick={handleEmailSignup}
                            className="w-4/5 mx-auto py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80 flex items-center justify-center gap-2 font-satoshi"
                            style={{
                                backgroundColor: 'var(--border-color)',
                                color: 'var(--text-primary)',
                                border: 'none'
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Continue with email
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-12">
                        <p className="text-xs font-satoshi" style={{ color: 'var(--text-secondary)' }}>
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-medium hover:underline"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Sign in
                            </Link>
                            {' '}or{' '}
                            <button
                                className="font-medium hover:underline"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Learn more
                            </button>
                        </p>
                    </div>
                </div>

                {/* Email Form Screen */}
                <div
                    className={`absolute inset-0 transition-opacity duration-300 ${showEmailForm && !showOtpForm && !showCredentialsForm ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                    {/* Logo */}
                    <div className="text-center mb-12">
                        <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center">
                            <svg className="w-16 h-16" viewBox="0 0 256 256" fill="none">
                                <circle cx="128" cy="128" r="120" fill="#47848F" />
                                <circle cx="128" cy="128" r="100" fill="#9FEAF9" />
                                <circle cx="128" cy="128" r="85" fill="#47848F" />
                                <circle cx="128" cy="128" r="70" fill="#9FEAF9" />
                                <circle cx="128" cy="128" r="55" fill="#47848F" />
                                <circle cx="128" cy="128" r="40" fill="#9FEAF9" />
                                <circle cx="128" cy="128" r="25" fill="#47848F" />
                            </svg>
                        </div>
                        <h1
                            className="text-lg font-medium font-satoshi"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            What's your email address?
                        </h1>
                    </div>

                    {/* Form */}
                    <div className="space-y-3">
                        {/* Email Input */}
                        <div>
                            <input
                                type="email"
                                placeholder="Enter your email address..."
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (emailError) setEmailError(''); // Clear error on typing
                                }}
                                className="w-4/5 mx-auto block px-4 py-3 rounded-lg font-satoshi text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                                style={{
                                    backgroundColor: 'var(--bg-primary)',
                                    border: emailError ? '1px solid #ef4444' : '1px solid var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            {emailError && (
                                <p className="text-xs font-satoshi mt-2 text-center" style={{ color: '#ef4444' }}>
                                    {emailError}
                                </p>
                            )}
                        </div>

                        {/* Continue Button */}
                        <button
                            onClick={handleEmailSubmit}
                            disabled={isSubmitting}
                            className="w-4/5 mx-auto py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80 font-satoshi flex items-center justify-center"
                            style={{
                                backgroundColor: 'var(--border-color)',
                                color: 'var(--text-primary)',
                                border: 'none'
                            }}
                        >
                            {isSubmitting ? 'Sending code...' : 'Continue with email'}
                        </button>

                        {/* Submit error */}
                        {submitError && (
                            <p className="text-xs font-satoshi mt-2 text-center" style={{ color: '#ef4444' }}>
                                {submitError}
                            </p>
                        )}
                    </div>

                    {/* Back to Signup Link */}
                    <div className="text-center mt-12">
                        <button
                            onClick={handleBackToSignup}
                            className="text-xs font-medium font-satoshi hover:underline transition-all"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Back to signup
                        </button>
                    </div>
                </div>

                {/* OTP Verification Screen */}
                <div
                    className={`absolute inset-0 transition-opacity duration-300 ${showOtpForm && !showCredentialsForm ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                    {/* Logo */}
                    <div className="text-center mb-12">
                        <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center">
                            <svg className="w-16 h-16" viewBox="0 0 256 256" fill="none">
                                <circle cx="128" cy="128" r="120" fill="#47848F" />
                                <circle cx="128" cy="128" r="100" fill="#9FEAF9" />
                                <circle cx="128" cy="128" r="85" fill="#47848F" />
                                <circle cx="128" cy="128" r="70" fill="#9FEAF9" />
                                <circle cx="128" cy="128" r="55" fill="#47848F" />
                                <circle cx="128" cy="128" r="40" fill="#9FEAF9" />
                                <circle cx="128" cy="128" r="25" fill="#47848F" />
                            </svg>
                        </div>
                        <h1
                            className="text-lg font-medium font-satoshi mb-2"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Enter verification code
                        </h1>
                        <p className="text-xs font-satoshi" style={{ color: 'var(--text-secondary)' }}>
                            We sent a code to {email}
                        </p>
                    </div>

                    {/* OTP Input */}
                    <div className="space-y-6">
                        <div className="flex justify-center gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    value={digit}
                                    onChange={(e) => {
                                        handleOtpChange(index, e.target.value);
                                        if (otpError) setOtpError(''); // Clear error on typing
                                    }}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    onPaste={(e) => handleOtpPaste(index, e)}
                                    className="w-10 h-12 text-center text-lg font-medium font-satoshi rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                                    style={{
                                        backgroundColor: 'var(--bg-primary)',
                                        border: otpError ? '1px solid #ef4444' : '1px solid var(--border-color)',
                                        color: 'var(--text-primary)'
                                    }}
                                    maxLength={1}
                                />
                            ))}
                        </div>
                        {otpError && (
                            <p className="text-xs font-satoshi text-center" style={{ color: '#ef4444' }}>
                                {otpError}
                            </p>
                        )}

                        {/* Verify Button */}
                        <button
                            onClick={handleOtpSubmit}
                            disabled={isSubmitting}
                            className="w-4/5 mx-auto py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80 font-satoshi flex items-center justify-center"
                            style={{
                                backgroundColor: 'var(--border-color)',
                                color: 'var(--text-primary)',
                                border: 'none'
                            }}
                        >
                            {isSubmitting ? 'Verifying...' : 'Verify code'}
                        </button>

                        {/* Resend Code */}
                        <div className="text-center">
                            <button
                                className="text-xs font-medium font-satoshi hover:underline transition-all"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Didn't receive code? Resend
                            </button>
                        </div>
                    </div>

                    {/* Back to Email Link */}
                    <div className="text-center mt-8">
                        <button
                            onClick={handleBackToEmail}
                            className="text-xs font-medium font-satoshi hover:underline transition-all"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Back to email
                        </button>
                    </div>
                </div>

                {/* Credentials Screen */}
                <div
                    className={`absolute inset-0 transition-opacity duration-300 ${showCredentialsForm ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                    {/* Logo */}
                    <div className="text-center mb-12">
                        <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center">
                            <svg className="w-16 h-16" viewBox="0 0 256 256" fill="none">
                                <circle cx="128" cy="128" r="120" fill="#47848F" />
                                <circle cx="128" cy="128" r="100" fill="#9FEAF9" />
                                <circle cx="128" cy="128" r="85" fill="#47848F" />
                                <circle cx="128" cy="128" r="70" fill="#9FEAF9" />
                                <circle cx="128" cy="128" r="55" fill="#47848F" />
                                <circle cx="128" cy="128" r="40" fill="#9FEAF9" />
                                <circle cx="128" cy="128" r="25" fill="#47848F" />
                            </svg>
                        </div>
                        <h1
                            className="text-lg font-medium font-satoshi"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Create your credentials
                        </h1>
                    </div>

                    {/* Form */}
                    <div className="space-y-3">
                        {/* Username Input */}
                        <div>
                            <input
                                type="text"
                                placeholder="Choose a username..."
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    if (usernameError) setUsernameError('');
                                }}
                                className="w-4/5 mx-auto block px-4 py-3 rounded-lg font-satoshi text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                                style={{
                                    backgroundColor: 'var(--bg-primary)',
                                    border: usernameError ? '1px solid #ef4444' : '1px solid var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            {usernameError && (
                                <p className="text-xs font-satoshi mt-2 text-center" style={{ color: '#ef4444' }}>
                                    {usernameError}
                                </p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <input
                                type="password"
                                placeholder="Create a password..."
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (passwordError) setPasswordError('');
                                }}
                                className="w-4/5 mx-auto block px-4 py-3 rounded-lg font-satoshi text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                                style={{
                                    backgroundColor: 'var(--bg-primary)',
                                    border: passwordError ? '1px solid #ef4444' : '1px solid var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            {passwordError && (
                                <p className="text-xs font-satoshi mt-2 text-center" style={{ color: '#ef4444' }}>
                                    {passwordError}
                                </p>
                            )}
                        </div>

                        {/* Create account */}
                        <button
                            onClick={handleRegisterSubmit}
                            className="w-4/5 mx-auto py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80 font-satoshi flex items-center justify-center"
                            style={{
                                backgroundColor: 'var(--border-color)',
                                color: 'var(--text-primary)',
                                border: 'none'
                            }}
                        >
                            {isSubmitting ? 'Creating account...' : 'Create account'}
                        </button>

                        {/* Submit error */}
                        {submitError && (
                            <p className="text-xs font-satoshi mt-2 text-center" style={{ color: '#ef4444' }}>
                                {submitError}
                            </p>
                        )}
                    </div>

                    {/* Back to OTP Link */}
                    <div className="text-center mt-12">
                        <button
                            onClick={handleBackToOtp}
                            className="text-xs font-medium font-satoshi hover:underline transition-all"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Back to verification
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;