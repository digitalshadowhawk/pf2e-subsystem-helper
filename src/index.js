
import BasicApplication from './lib/BasicApplication.js';

Hooks.once('ready', () => new BasicApplication().render(true, { focus: true }));