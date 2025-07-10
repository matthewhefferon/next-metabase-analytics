#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function detectProjectType() {
  const cwd = process.cwd();
  
  // Check for Next.js App Router
  if (fs.existsSync(path.join(cwd, 'src', 'app'))) {
    return 'app-router';
  }
  
  // Check for Next.js Pages Router
  if (fs.existsSync(path.join(cwd, 'pages'))) {
    return 'pages-router';
  }
  
  // Default to pages router for compatibility
  return 'pages-router';
}

function createApiRoute(projectType) {
  const cwd = process.cwd();
  
  if (projectType === 'app-router') {
    const routeDir = path.join(cwd, 'src', 'app', 'api', 'compass-event');
    const routeFile = path.join(routeDir, 'route.ts');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    
    const routeContent = `import { compassEventHandler } from "metabase-compass";

export async function POST(request: Request) {
  const body = await request.json();
  const req = { method: 'POST', body };
  const res = {
    status: (code: number) => ({ json: (data: any) => new Response(JSON.stringify(data), { status: code }) }),
    json: (data: any) => new Response(JSON.stringify(data))
  };
  return await compassEventHandler(req, res);
}
`;
    
    fs.writeFileSync(routeFile, routeContent);
    console.log('✅ Created App Router API route: src/app/api/compass-event/route.ts');
    
  } else {
    const routeFile = path.join(cwd, 'pages', 'api', 'compass-event.js');
    
    // Create pages/api directory if it doesn't exist
    const apiDir = path.dirname(routeFile);
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }
    
    const routeContent = `import { compassEventHandler } from "metabase-compass";
export default compassEventHandler;
`;
    
    fs.writeFileSync(routeFile, routeContent);
    console.log('✅ Created Pages Router API route: pages/api/compass-event.js');
  }
}

function copySnippet() {
  const cwd = process.cwd();
  const publicDir = path.join(cwd, 'public');
  const snippetDest = path.join(publicDir, 'compass-snippet.js');
  const snippetSrc = path.join(__dirname, '..', 'public', 'compass-snippet.js');
  
  // Create public directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Copy the snippet
  fs.copyFileSync(snippetSrc, snippetDest);
  console.log('✅ Copied tracking snippet to: public/compass-snippet.js');
}

function main() {
  try {
    console.log('🧭 Setting up Metabase Compass...');
    
    const projectType = detectProjectType();
    console.log(`📁 Detected project type: ${projectType === 'app-router' ? 'Next.js App Router' : 'Next.js Pages Router'}`);
    
    createApiRoute(projectType);
    copySnippet();
    
    console.log('\n🎉 Setup complete! Next steps:');
    console.log('1. Add the script tag to your <head>: <script src="/compass-snippet.js"></script>');
    console.log('2. Add DATABASE_URL to your .env.local file');
    console.log('3. Create the database table (see README for SQL)');
    console.log('\n📖 Full documentation: https://github.com/yourusername/metabase-compass');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n📖 Manual setup instructions: https://github.com/yourusername/metabase-compass');
    process.exit(1);
  }
}

main(); 