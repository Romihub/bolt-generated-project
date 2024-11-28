import { exec } from 'child_process';

const ports = [3001, 3002, 3003, 3004, 5173];

const killPort = (port) => {
  return new Promise((resolve) => {
    exec(`lsof -i :${port} | grep LISTEN | awk '{print $2}' | xargs -r kill -9`, (error) => {
      if (error) {
        console.log(`No process running on port ${port}`);
      } else {
        console.log(`Killed process on port ${port}`);
      }
      resolve();
    });
  });
};

const killAllPorts = async () => {
  for (const port of ports) {
    await killPort(port);
  }
  console.log('All ports cleared');
};

killAllPorts();
