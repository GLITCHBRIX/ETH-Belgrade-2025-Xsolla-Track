import { exec } from 'child_process';

console.log('Starting server and blockchain listener...');

// Start the server with the listener enabled
process.env.ENABLE_LISTENER = 'true';

// Run the server with the listener enabled
const server = exec('yarn dev');

server.stdout?.on('data', (data) => {
  console.log(data.toString().trim());
});

server.stderr?.on('data', (data) => {
  console.error(data.toString().trim());
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code || 0);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down all services...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down all services...');
  process.exit(0);
}); 