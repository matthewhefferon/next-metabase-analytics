#!/usr/bin/env node

console.log("[next-metabase-analytics setup] Script started");

const fs = require("fs");
const path = require("path");

function detectProjectType() {
  const cwd = process.cwd();
  // Check for Next.js App Router (prioritize this)
  if (
    fs.existsSync(path.join(cwd, "src", "app")) ||
    fs.existsSync(path.join(cwd, "app"))
  ) {
    return "app-router";
  }
  // Check for Next.js Pages Router
  if (fs.existsSync(path.join(cwd, "pages"))) {
    return "pages-router";
  }
  // Default to pages router for compatibility
  return "pages-router";
}

function detectAppDirectory() {
  const cwd = process.cwd();
  // Check if using src/app structure
  if (fs.existsSync(path.join(cwd, "src", "app"))) {
    return "src/app";
  }
  // Check if using app structure
  if (fs.existsSync(path.join(cwd, "app"))) {
    return "app";
  }
  // Default to app
  return "app";
}

function createApiRoute(projectType) {
  const cwd = process.cwd();
  try {
    if (projectType === "app-router") {
      const appDir = detectAppDirectory();
      const routeDir = path.join(cwd, appDir, "api", "next-analytics-event");
      const routeFile = path.join(routeDir, "route.ts");
      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
      }
      const routeContent = `import { analyticsEventHandler } from "next-metabase-analytics";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const req = { method: "POST", body };
    const res = {
      status: (code: number) => ({
        json: (data: any) => new Response(JSON.stringify(data), { status: code }),
      }),
      json: (data: any) => new Response(JSON.stringify(data)),
    };
    const result = await analyticsEventHandler(req, res);
    if (result instanceof Response) return result;
    // Always return a Response, even if handler returns nothing
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
`;
      fs.writeFileSync(routeFile, routeContent);
      console.log(
        `[next-metabase-analytics setup] Created App Router API route: ${appDir}/api/next-analytics-event/route.ts`
      );
    } else {
      const routeFile = path.join(cwd, "pages", "api", "next-analytics-event.js");
      const apiDir = path.dirname(routeFile);
      if (!fs.existsSync(apiDir)) {
        fs.mkdirSync(apiDir, { recursive: true });
      }
      const routeContent = `import { analyticsEventHandler } from "next-metabase-analytics";\nexport default analyticsEventHandler;\n`;
      fs.writeFileSync(routeFile, routeContent);
      console.log(
        "[next-metabase-analytics setup] Created Pages Router API route: pages/api/next-analytics-event.js"
      );
    }
  } catch (err) {
    console.error(
      "[next-metabase-analytics setup] Error creating API route:",
      err
    );
  }
}

function copySnippet() {
  const cwd = process.cwd();
  const publicDir = path.join(cwd, "public");
  const snippetDest = path.join(publicDir, "next-analytics-snippet.js");
  const snippetSrc = path.join(__dirname, "..", "public", "next-analytics-snippet.js");
  try {
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.copyFileSync(snippetSrc, snippetDest);
    console.log(
      "[next-metabase-analytics setup] Copied tracking snippet to: public/next-analytics-snippet.js"
    );
  } catch (err) {
    console.error(
      "[next-metabase-analytics setup] Error copying snippet:",
      err
    );
  }
}

function addScriptTag(projectType) {
  const cwd = process.cwd();
  try {
    let layoutFile;
    if (projectType === "app-router") {
      const appDir = detectAppDirectory();
      layoutFile = path.join(cwd, appDir, "layout.tsx");
    } else {
      layoutFile = path.join(cwd, "pages", "_app.tsx");
    }

    if (!fs.existsSync(layoutFile)) {
      console.log(
        "[next-metabase-analytics setup] Layout file not found, you'll need to add the script tag manually"
      );
      return;
    }

    let content = fs.readFileSync(layoutFile, "utf8");

    // Check if script tag already exists
    if (content.includes("/next-analytics-snippet.js")) {
      console.log(
        "[next-metabase-analytics setup] Script tag already exists in layout file"
      );
      return;
    }

          // Add script tag to head
      if (content.includes("<html")) {
        // Find the html tag and add head with script
        content = content.replace(
          /<html([^>]*)>/,
          '<html$1>\n      <head>\n        <script src="/next-analytics-snippet.js"></script>\n      </head>'
        );
      fs.writeFileSync(layoutFile, content);
      console.log(
        `[next-metabase-analytics setup] Added script tag to: ${layoutFile}`
      );
    } else {
      console.log(
        "[next-metabase-analytics setup] Could not find html tag, you'll need to add the script tag manually"
      );
    }
  } catch (err) {
    console.error(
      "[next-metabase-analytics setup] Error adding script tag:",
      err
    );
  }
}

function main() {
  try {
    console.log("[next-metabase-analytics setup] Running main setup...");
    const projectType = detectProjectType();
    console.log(
      `[next-metabase-analytics setup] Detected project type: ${projectType}`
    );
    createApiRoute(projectType);
    copySnippet();
    addScriptTag(projectType);
    console.log("[next-metabase-analytics setup] Setup complete!");
  } catch (error) {
    console.error(
      "[next-metabase-analytics setup] Setup failed:",
      error.message
    );
    process.exit(1);
  }
}

main();
