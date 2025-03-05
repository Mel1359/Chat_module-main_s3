const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Мок для fetch
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  })
);

// Мок для socket.io-client
jest.mock('socket.io-client', () => {
  return jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn()
  }));
});

// Мокаем window.location
global.window = Object.create(window);
Object.defineProperty(window, 'location', {
    value: {
        replace: jest.fn(),
        href: ''
    },
    writable: true
});

// Мокаем localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
};
global.localStorage = localStorageMock;

// Мокаем socket.io
global.io = jest.fn();

// Очищаем моки перед каждым тестом
beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
    window.location.replace.mockClear();
    window.location.href = '';
    if (global.io.mockClear) {
        global.io.mockClear();
    }
});

// Мокаем console.log и console.error для чистоты вывода тестов
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn()
}; 