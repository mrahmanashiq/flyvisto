// Global test setup
require('dotenv').config({ path: '.env.test' });

// Increase timeout for all tests
jest.setTimeout(10000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock Date.now for consistent timestamps in tests
const mockDate = new Date('2023-01-01T00:00:00.000Z');
global.Date.now = jest.fn(() => mockDate.getTime());

// Global test utilities
global.testUtils = {
  mockUser: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'customer',
    isEmailVerified: true,
    isActive: true,
  },
  
  mockFlight: {
    id: '123e4567-e89b-12d3-a456-426614174001',
    flightNumber: 'AA123',
    departureTime: '2023-12-01T10:00:00.000Z',
    arrivalTime: '2023-12-01T14:00:00.000Z',
    basePrice: 299.99,
    availableSeats: 100,
    totalSeats: 150,
    status: 'scheduled',
  },

  createMockRequest: (overrides = {}) => ({
    body: {},
    query: {},
    params: {},
    headers: {},
    user: null,
    ...overrides,
  }),

  createMockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  },

  createMockNext: () => jest.fn(),
};

// Setup test database connection
beforeAll(async () => {
  // Database setup would go here
  // For now, we'll mock it
});

afterAll(async () => {
  // Database cleanup would go here
});

// Reset all mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});
