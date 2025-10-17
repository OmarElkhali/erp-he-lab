import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FaEnvelope, FaLock, FaSignInAlt, FaSpinner, FaShieldAlt, FaUser, FaKey } from 'react-icons/fa';

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
            <Head title="Connexion - Laboratoire" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
                <div className="w-full max-w-sm mx-auto">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* Logo centré */}
                        <div className="p-4 text-center border-b border-gray-100">
                            <div className="flex justify-center mb-2">
                                <img
                                    src="/images/logo-sm.png"
                                    alt="Laboratory Logo"
                                    className="h-12 w-auto"
                                />
                            </div>
                            <h1 className="text-lg font-bold text-[#26658C] mb-0">
                                Hse-Lab Online
                            </h1>
                            <p className="text-gray-600 text-xs mt-1">
                                Système de Gestion Laboratoire
                            </p>
                        </div>

                        <div className="p-6">
                            {status && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-4">
                                    <p className="text-green-700 text-xs text-center">{status}</p>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-4">
                                {/* Champ Email */}
                                <div>
                                    <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                                        <div className="flex items-center">
                                            <FaEnvelope className="w-3 h-3 text-[#26658C] mr-2" />
                                            Adresse Email
                                        </div>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="h-3 w-3 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#26658C] focus:border-[#26658C] transition-colors"
                                            placeholder="votre@email.com"
                                            required
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-xs text-red-600 flex items-center">
                                            <FaSpinner className="w-2 h-2 mr-1" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Champ Mot de passe */}
                                <div>
                                    <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                                        <div className="flex items-center">
                                            <FaLock className="w-3 h-3 text-[#26658C] mr-2" />
                                            Mot de Passe
                                        </div>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaKey className="h-3 w-3 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            id="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#26658C] focus:border-[#26658C] transition-colors"
                                            placeholder="Votre mot de passe"
                                            required
                                        />
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-xs text-red-600 flex items-center">
                                            <FaSpinner className="w-2 h-2 mr-1" />
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Bouton de connexion */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-gradient-to-r from-[#26658C] to-blue-700 hover:from-blue-700 hover:to-[#26658C] text-white py-2 px-4 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? (
                                            <div className="flex items-center justify-center">
                                                <FaSpinner className="animate-spin w-3 h-3 mr-2" />
                                                Connexion...
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center">
                                                <FaSignInAlt className="w-3 h-3 mr-2" />
                                                Accéder au Système
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Footer sécurisé */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-center text-center">
                                    <FaShieldAlt className="w-3 h-3 text-green-500 mr-1" />
                                    <span className="text-xs text-gray-500">
                                        Système sécurisé • Protégé par chiffrement
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-400">
                            © 2025 Hse-Lab Online
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}