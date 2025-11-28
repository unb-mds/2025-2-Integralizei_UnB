// jest.setup.js
import '@testing-library/jest-dom';

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ token: "fake-token-123", message: "Sucesso" }),
  })
); 