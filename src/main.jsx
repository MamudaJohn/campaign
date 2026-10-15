import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import Experience from './Experience.jsx';
import { candidateIdFromLocation } from './lib/arena.mjs';

const root = document.getElementById('root');
const candidateId = candidateIdFromLocation(window.location) || (root.dataset.page === '404' ? '__not-found__' : null);
const app = <Experience candidateId={candidateId}/>;
if (root.hasChildNodes() && root.dataset.candidateId === (candidateId || '')) hydrateRoot(root, app);
else createRoot(root).render(app);
