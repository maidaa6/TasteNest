import { assertConfig, config } from './config.js';
import { createApp } from './app.js';

assertConfig();

createApp().listen(config.port, () => {
  console.log(`TasteNest API listening on http://localhost:${config.port}/api`);
});
