import "dotenv/config";
import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { env } from "@/env";
import { auth } from "@/lib/auth";
import { createContext } from "@/lib/context";
import { appRouter } from "@/routers/index";
import * as fs from "node:fs";
import * as path from "node:path";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: env.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

const handler = new RPCHandler(appRouter);
app.use("/rpc/*", async (c, next) => {
	const context = await createContext({ context: c });
	const { matched, response } = await handler.handle(c.req.raw, {
		prefix: "/rpc",
		context: context,
	});

	if (matched) {
		return c.newResponse(response.body, response);
	}
	await next();
});

// Serve static assets from the built web app
app.use('/assets/*', serveStatic({ 
	root: path.join(process.cwd(), '../web/dist'),
	rewriteRequestPath: (path) => path
}));

// Serve favicon
app.use('/favicon.ico', serveStatic({ 
	root: path.join(process.cwd(), '../web/dist'),
	rewriteRequestPath: () => '/favicon.ico'
}));

// SSR route handler for all other routes
app.get("*", async (c) => {
	// Read the built HTML template and serve it
	try {
		const htmlPath = path.join(process.cwd(), '../web/dist/index.html');
		const html = await fs.promises.readFile(htmlPath, 'utf-8');
		
		// In the future, this is where we would inject server-rendered React content
		// For now, we serve the built HTML which will be hydrated on the client
		return c.html(html);
	} catch (error) {
		// Fallback HTML template if built file doesn't exist
		const fallbackHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PMI Exam Portal</title>
    <link rel="icon" href="/favicon.ico" />
  </head>
  <body>
    <div id="app">
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
        <div>Loading...</div>
      </div>
    </div>
  </body>
</html>`;
		return c.html(fallbackHtml);
	}
});

export default app;
