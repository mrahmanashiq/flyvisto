import { Logger } from '../../../src/config/index.js';

console.log('Starting logger test...');

// Function to generate a random log message
const generateRandomLog = () => {
  const levels = ['info', 'warn', 'error'];
  const level = levels[Math.floor(Math.random() * levels.length)];
  const message = `Test log message ${Math.random().toString(36).substring(2, 15)}`;
  
  const meta = {
    timestamp: new Date().toISOString(),
    requestId: Math.random().toString(36).substring(2, 10),
    testData: {
      value: Math.floor(Math.random() * 1000),
      isTest: true
    }
  };
  
  return { level, message, meta };
}

// Modify rotation settings temporarily for testing
// Note: This assumes you're exporting the transports in your logger-config.js
// If not, you'd need to modify your code to make these accessible for testing

// Generate many logs quickly
console.log('Generating logs...');
const startTime = Date.now();
const endTime = startTime + (5 * 60 * 1000); // 5 minutes

// Accelerated testing - generate logs faster than normal
const interval = setInterval(() => {
  if (Date.now() > endTime) {
    clearInterval(interval);
    console.log('Test complete!');
    process.exit(0);
  }
  
  // Generate multiple logs per interval
  for (let i = 0; i < 10; i++) {
    const { level, message, meta } = generateRandomLog();
    Logger[level](message, meta);
  }
}, 100); // Generate logs every 100ms