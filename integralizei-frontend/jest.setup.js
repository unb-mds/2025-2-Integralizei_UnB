import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Isso é necessário para o Next.js não reclamar
Object.assign(global, { TextEncoder, TextDecoder });

// Mantemos seu mock de fetch global para segurança
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ token: "fake-token-123", message: "Sucesso" }),
  })
);