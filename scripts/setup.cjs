#!/usr/bin/env node

console.log("[metabase-compass setup] Script started");

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

function createApiRoute(projectType) {
  const cwd = process.cwd();
  try {
    if (projectType === "app-router") {
      // Always use app/api/compass-event/route.ts (never src/)
      const routeDir = path.join(cwd, "app", "api", "compass-event");
      const routeFile = path.join(routeDir, "route.ts");
      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
      }
      const routeContent = `import { compassEventHandler } from "metabase-compass";
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
    const result = await compassEventHandler(req, res);
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
        "[metabase-compass setup] Created App Router API route: app/api/compass-event/route.ts"
      );
      // Remove old src/app/api/compass-event/route.ts if it exists
      const oldRoute = path.join(
        cwd,
        "src",
        "app",
        "api",
        "compass-event",
        "route.ts"
      );
      if (fs.existsSync(oldRoute)) {
        fs.rmSync(oldRoute, { force: true });
        // Optionally remove empty dirs
        const oldDir = path.join(cwd, "src", "app", "api", "compass-event");
        try {
          fs.rmdirSync(oldDir);
        } catch {}
      }
    } else {
      const routeFile = path.join(cwd, "pages", "api", "compass-event.js");
      const apiDir = path.dirname(routeFile);
      if (!fs.existsSync(apiDir)) {
        fs.mkdirSync(apiDir, { recursive: true });
      }
      const routeContent = `import { compassEventHandler } from "metabase-compass";\nexport default compassEventHandler;\n`;
      fs.writeFileSync(routeFile, routeContent);
      console.log(
        "[metabase-compass setup] Created Pages Router API route: pages/api/compass-event.js"
      );
    }
  } catch (err) {
    console.error("[metabase-compass setup] Error creating API route:", err);
  }
}

function copySnippet() {
  const cwd = process.cwd();
  const publicDir = path.join(cwd, "public");
  const snippetDest = path.join(publicDir, "compass-snippet.js");
  const snippetSrc = path.join(__dirname, "..", "public", "compass-snippet.js");
  try {
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.copyFileSync(snippetSrc, snippetDest);
    console.log(
      "[metabase-compass setup] Copied tracking snippet to: public/compass-snippet.js"
    );
  } catch (err) {
    console.error("[metabase-compass setup] Error copying snippet:", err);
  }
}

function addScriptTag(projectType) {
  const cwd = process.cwd();
  try {
    let layoutFile;
    if (projectType === "app-router") {
      layoutFile = path.join(cwd, "app", "layout.tsx");
      if (!fs.existsSync(layoutFile)) {
        layoutFile = path.join(cwd, "src", "app", "layout.tsx");
      }
    } else {
      layoutFile = path.join(cwd, "pages", "_app.tsx");
    }

    if (!fs.existsSync(layoutFile)) {
      console.log(
        "[metabase-compass setup] Layout file not found, you'll need to add the script tag manually"
      );
      return;
    }

    let content = fs.readFileSync(layoutFile, "utf8");

    // Check if script tag already exists
    if (content.includes("/compass-snippet.js")) {
      console.log(
        "[metabase-compass setup] Script tag already exists in layout file"
      );
      return;
    }

    // Add script tag to head
    if (content.includes("<html")) {
      // Find the html tag and add head with script
      content = content.replace(
        /<html([^>]*)>/,
        '<html$1>\n      <head>\n        <script src="/compass-snippet.js"></script>\n      </head>'
      );
      fs.writeFileSync(layoutFile, content);
      console.log(
        `[metabase-compass setup] Added script tag to: ${layoutFile}`
      );
    } else {
      console.log(
        "[metabase-compass setup] Could not find html tag, you'll need to add the script tag manually"
      );
    }
  } catch (err) {
    console.error("[metabase-compass setup] Error adding script tag:", err);
  }
}

function main() {
  try {
    console.log("[metabase-compass setup] Running main setup...");
    const projectType = detectProjectType();
    console.log(
      `[metabase-compass setup] Detected project type: ${projectType}`
    );
    createApiRoute(projectType);
    copySnippet();
    addScriptTag(projectType);
    console.log("[metabase-compass setup] Setup complete!");
  } catch (error) {
    console.error("[metabase-compass setup] Setup failed:", error.message);
    process.exit(1);
  }
}

main();
