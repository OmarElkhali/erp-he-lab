import React from 'react';

export default function TestBootstrap() {
  return (
    <div className="container mt-5">
      <h1 className="text-center text-primary">✅ Bootstrap fonctionne !</h1>
      <button className="btn btn-success mt-3" data-bs-toggle="tooltip" title="Coucou 👋">
        Test Tooltip
      </button>
    </div>
  );
}
