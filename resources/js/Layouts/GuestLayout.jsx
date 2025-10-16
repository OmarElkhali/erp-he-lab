import { useState } from 'react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen">
            {/* Inclure les CSS nécessaires */}
            <link 
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
                rel="stylesheet" 
            />
            <link 
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
                rel="stylesheet" 
            />
            <link 
                href="https://cdnjs.cloudflare.com/ajax/libs/dripicons/2.0.0/webfont.css" 
                rel="stylesheet" 
            />
            
            {/* Styles personnalisés pour correspondre au design */}
            <style>
                {`
                .auth-header-box {
                    background: #fff !important; /* fond blanc */
                }

                
                .thumb-md {
                    width: 40px;
                    height: 40px;
                }
                
                .bg-blue-subtle {
                    background-color: rgba(59, 130, 246, 0.1) !important;
                }
                
                .bg-info-subtle {
                    background-color: rgba(6, 182, 212, 0.1) !important;
                }
                
                .bg-danger-subtle {
                    background-color: rgba(239, 68, 68, 0.1) !important;
                }
                
                .text-blue {
                    color: #3b82f6 !important;
                }
                
                .form-switch-success .form-check-input:checked {
                    background-color: #10b981;
                    border-color: #10b981;
                }
                
                .btn-primary {
                    background-color: #26658C;
                    border-color: #26658C;
                }
                
                .btn-primary:hover {
                    background-color: #1e5270;
                    border-color: #1e5270;
                }

                .container-xxl {
                    max-width: 100%;
                    padding-right: 15px;
                    padding-left: 15px;
                    margin-right: auto;
                    margin-left: auto;
                }
                `}
            </style>

            {children}
        </div>
    );
}