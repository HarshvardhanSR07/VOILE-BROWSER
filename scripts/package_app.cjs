process.on('uncaughtException', err => console.error('Uncaught exception:', err));
process.on('unhandledRejection', (reason, promise) => console.error('Unhandled rejection:', reason));

const packager = require('electron-packager');

async function build() {
  console.log('Starting Voile desktop packaging...');
  try {
    const appPaths = await packager({
      dir: '.',
      name: 'Voile',
      platform: 'win32',
      arch: 'x64',
      out: 'release-builds',
      electronVersion: '45.0.0',
      overwrite: true,
      quiet: false
    });
    console.log('Packaging complete! Application built at:', appPaths);
  } catch (err) {
    console.error('Packaging failed:', err);
  }
}

build();
