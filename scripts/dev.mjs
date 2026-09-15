import {spawn} from 'node:child_process';
const children=[spawn(process.execPath,['node_modules/wrangler/bin/wrangler.js','dev','--local','--port','8787'],{stdio:'inherit'}),spawn(process.execPath,['node_modules/vite/bin/vite.js'],{stdio:'inherit'})];
for(const child of children)child.on('exit',()=>{for(const c of children)c.kill();});
process.on('SIGINT',()=>{for(const c of children)c.kill();process.exit(0);});
