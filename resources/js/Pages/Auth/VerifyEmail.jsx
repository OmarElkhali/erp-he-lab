import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, router } from '@inertiajs/react';
import { FaEnvelope, FaKey, FaCheckCircle, FaSpinner, FaRedo, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';

export default function VerifyEmail({ email, message, csrf_token }) {
    const [code, setCode] = useState('');
    const [processing, setProcessing] = useState(false);
    const [resending, setResending] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState(message || '');

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setSuccessMessage('');

        console.log('Submitting verification with:', { email, code });

        try {
            const response = await axios.post('/verification/verify', {
                email: email,
                code: code,
                _token: csrf_token || document.querySelector('meta[name="csrf-token"]')?.content
            });

            console.log('Verification successful', response.data);

            // Vérification réussie
            if (response.data.success) {
                setSuccessMessage(response.data.message || 'Vérification réussie!');

                // Rediriger après 1 seconde
                setTimeout(() => {
                    window.location.href = response.data.redirect || '/login';
                }, 1000);
            }
        } catch (error) {
            console.error('Verification errors:', error.response?.data);

            setProcessing(false);
            setSuccessMessage('');

            // Gérer les erreurs de validation
            if (error.response?.status === 422) {
                // Code incorrect ou expiré
                if (error.response.data?.errors) {
                    setErrors(error.response.data.errors);
                } else if (error.response.data?.message) {
                    setErrors({ code: error.response.data.message });
                }
            } else {
                // Autre erreur
                setErrors({ code: '⚠️ Une erreur est survenue. Veuillez réessayer.' });
            }
        }
    };    const resendCode = async (e) => {
        e.preventDefault();
        console.log('Resending code to:', email);
        setResending(true);
        setErrors({});

        try {
            const response = await axios.post('/verification/resend', {
                email: email,
                _token: csrf_token || document.querySelector('meta[name="csrf-token"]')?.content
            });

            console.log('Code resent successfully', response);
            setSuccessMessage('Un nouveau code a été envoyé à votre adresse e-mail.');
        } catch (error) {
            console.error('Resend errors:', error.response?.data);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setResending(false);
        }
    };    return (
        <GuestLayout>
            <Head title="Vérification Email" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 text-center border-b border-gray-100 bg-gradient-to-r from-blue-50 to-emerald-50">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                                    <FaEnvelope className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-[#26658C] mb-2">
                                Vérification de l'Email
                            </h1>
                            <p className="text-gray-600 text-sm">
                                Un code de vérification a été envoyé à
                            </p>
                            <p className="text-blue-600 font-semibold mt-1">
                                {email}
                            </p>
                        </div>

                        <div className="p-6">
                            {successMessage && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                                    <FaCheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-green-800">{successMessage}</p>
                                </div>
                            )}

                            {errors.email && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{errors.email}</p>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                {/* Champ Code */}
                                <div>
                                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                                        <div className="flex items-center">
                                            <FaKey className="w-4 h-4 text-[#26658C] mr-2" />
                                            Code de Vérification
                                        </div>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="code"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            className="block w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26658C] focus:border-[#26658C] transition-all"
                                            placeholder="000000"
                                            maxLength="6"
                                            required
                                        />
                                    </div>
                                    {errors.code && (
                                        <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                                            <div className="flex items-center">
                                                <FaExclamationTriangle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                                                <p className="text-sm font-medium text-red-800">{errors.code}</p>
                                            </div>
                                        </div>
                                    )}
                                    <p className="mt-2 text-xs text-gray-500 text-center">
                                        Entrez le code à 6 chiffres reçu par e-mail
                                    </p>
                                </div>

                                {/* Bouton Vérifier */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#26658C] hover:bg-[#1e4d6b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#26658C] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {processing ? (
                                        <>
                                            <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                                            Vérification...
                                        </>
                                    ) : (
                                        <>
                                            <FaCheckCircle className="w-4 h-4 mr-2" />
                                            Vérifier le code
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Section Renvoyer le code */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-center text-sm text-gray-600 mb-3">
                                    Vous n'avez pas reçu le code ?
                                </p>
                                <button
                                    type="button"
                                    onClick={resendCode}
                                    disabled={resending}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#26658C] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {resending ? (
                                        <>
                                            <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>
                                            <FaRedo className="w-4 h-4 mr-2" />
                                            Renvoyer le code
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Instructions */}
                            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xs text-yellow-800">
                                    <strong>⏰ Important :</strong> Le code expire dans 30 minutes.
                                    Vérifiez également votre dossier spam/courrier indésirable.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
