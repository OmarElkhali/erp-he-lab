import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => reset('password');
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Log in" />
            <div className="container-xxl">
                <div className="row vh-100 d-flex justify-content-center align-items-center">
                    <div className="col-12 col-md-5 col-lg-4 mx-auto">
                        <div className="card shadow-lg border-0" style={{ 
                            borderRadius: '15px',
                            overflow: 'hidden',
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
                        }}>
                            <div className="card-body p-2 text-center rounded-top" style={{ 
                                background: 'linear-gradient(135deg, #ffffff 0%, #f1f8ff 100%)',
                                borderBottom: '2px solid #26658C'
                            }}>
                                <a href="/" className="logo logo-admin d-inline-block">
                                    <img 
                                        src="/images/logo-sm.png" 
                                        height="20" 
                                        alt="Laboratory Logo" 
                                    />
                                </a>
                                <h4 className="mt-1 mb-0 fw-bold" style={{ color: '#26658C', fontSize: '0.95rem' }}>
                                    Laboratory Access Portal
                                </h4>
                                <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>
                                    Secure authentication for laboratory system
                                </p>
                            </div>

                            <div className="card-body p-2">
                                {status && (
                                    <div className="alert alert-success border-0 shadow-sm" style={{ borderRadius: '10px', fontSize: '0.8rem', padding: '6px 10px', marginBottom: '8px' }}>
                                        {status}
                                    </div>
                                )}

                                <form className="my-2" onSubmit={submit}>
                                    <div className="form-group mb-2">
                                        <label htmlFor="email" className="form-label fw-semibold" style={{ color: '#2c3e50', fontSize: '0.85rem' }}>
                                            <i className="fas fa-envelope me-2" style={{ color: '#26658C' }}></i>
                                            Email Address
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0" style={{ padding: '5px 10px' }}>
                                                <i className="fas fa-user text-muted"></i>
                                            </span>
                                            <input
                                                type="email"
                                                className="form-control border-start-0"
                                                id="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Enter your laboratory email"
                                                required
                                                style={{ 
                                                    borderRadius: '0 6px 6px 0',
                                                    border: '1px solid #dee2e6',
                                                    borderLeft: 'none',
                                                    fontSize: '0.85rem',
                                                    padding: '5px 10px'
                                                }}
                                            />
                                        </div>
                                        {errors.email && (
                                            <div className="text-danger mt-1 small d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                                                <i className="fas fa-exclamation-circle me-2"></i>
                                                {errors.email}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group mb-2">
                                        <label htmlFor="password" className="form-label fw-semibold" style={{ color: '#2c3e50', fontSize: '0.85rem' }}>
                                            <i className="fas fa-lock me-2" style={{ color: '#26658C' }}></i>
                                            Password
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0" style={{ padding: '5px 10px' }}>
                                                <i className="fas fa-key text-muted"></i>
                                            </span>
                                            <input
                                                type="password"
                                                className="form-control border-start-0"
                                                id="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Enter your secure password"
                                                required
                                                style={{ 
                                                    borderRadius: '0 6px 6px 0',
                                                    border: '1px solid #dee2e6',
                                                    borderLeft: 'none',
                                                    fontSize: '0.85rem',
                                                    padding: '5px 10px'
                                                }}
                                            />
                                        </div>
                                        {errors.password && (
                                            <div className="text-danger mt-1 small d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                                                <i className="fas fa-exclamation-circle me-2"></i>
                                                {errors.password}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group mb-0 row">
                                        <div className="col-12">
                                            <div className="d-grid mt-1">
                                                <button
                                                    type="submit"
                                                    className="btn fw-semibold py-1"
                                                    disabled={processing}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #26658C 0%, #1e5270 100%)',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '0.85rem',
                                                        letterSpacing: '0.4px',
                                                        boxShadow: '0 3px 10px rgba(38, 101, 140, 0.3)',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.transform = 'translateY(-1px)';
                                                        e.target.style.boxShadow = '0 5px 15px rgba(38, 101, 140, 0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.transform = 'translateY(0)';
                                                        e.target.style.boxShadow = '0 3px 10px rgba(38, 101, 140, 0.3)';
                                                    }}
                                                >
                                                    {processing ? (
                                                        <>
                                                            <i className="fas fa-spinner fa-spin me-2"></i>
                                                            Authenticating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-sign-in-alt me-2"></i>
                                                            Access Laboratory System
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center mt-2 pt-1 border-top">
                                        <small className="text-muted d-flex align-items-center justify-content-center" style={{ fontSize: '0.7rem' }}>
                                            <i className="fas fa-shield-alt me-2 text-success"></i>
                                            Secure laboratory management system • Protected by advanced encryption
                                        </small>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
