// _middleware.js - Authentication middleware for Cloudflare Pages
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // ✅ EDITOR CREDENTIALS
  const EDITOR_PASSWORD = "Kunal@2004$";
  const VIEWER_TOKEN = "viewer_gullak_2024"; // Shared with cofounder
  
  // ✅ Allow static assets without auth
  if (url.pathname.startsWith("/assets") || url.pathname.endsWith(".css") || url.pathname.endsWith(".js")) {
    return context.next();
  }

  // ✅ Get current role from cookie
  const cookie = request.headers.get("cookie") || "";
  const isEditor = cookie.includes("gullak_role=editor");
  const isViewer = cookie.includes("gullak_role=viewer");

  // ✅ BLOCK EDIT OPERATIONS FOR VIEWERS
  if ((request.method === "POST" || request.method === "PUT" || request.method === "DELETE") && isViewer) {
    return new Response(JSON.stringify({ error: "Viewers cannot edit" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  // ✅ Allow editors and viewers to access content
  if (isEditor || isViewer) {
    return context.next();
  }

  // ✅ VIEWER LINK ACCESS (no login needed)
  if (url.searchParams.get("viewer") === VIEWER_TOKEN) {
    return new Response(getLoginResponse("viewer", true), {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Set-Cookie": `gullak_role=viewer; Max-Age=2592000; Path=/; SameSite=Strict`
      }
    });
  }

  // ✅ EDITOR LOGIN ATTEMPT
  if (request.method === "POST" && url.pathname === "/auth") {
    const body = await request.text();
    const pass = new URLSearchParams(body).get("password");
    
    if (pass === EDITOR_PASSWORD) {
      return new Response("OK", {
        status: 200,
        headers: {
          "Set-Cookie": `gullak_role=editor; Max-Age=2592000; Path=/; HttpOnly; SameSite=Strict`
        }
      });
    }
    return new Response("Unauthorized", { status: 401 });
  }

  // ✅ SHOW LOGIN PAGE
  if (request.method === "GET") {
    return new Response(getLoginResponse("login", false), {
      headers: { "Content-Type": "text/html" }
    });
  }

  return context.next();
}

// ✅ LOGIN PAGE HTML
function getLoginResponse(mode, isViewerAccess) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Kantex Gullak — ${mode === "editor" ? "Dashboard" : "Access"}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
          background: linear-gradient(135deg, #0e1512 0%, #1a2622 100%);
          color: #eef1ec; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 100vh; 
          padding: 16px;
        }
        .container {
          width: 100%;
          max-width: 380px;
        }
        .box { 
          background: #161f1a; 
          border: 1px solid #293630; 
          border-radius: 18px;
          padding: 40px 32px;
          backdrop-filter: blur(10px);
        }
        .badge {
          display: inline-block;
          background: ${mode === "editor" ? "#e8776b" : "#57b096"};
          color: white;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 16px;
          letter-spacing: 0.5px;
        }
        h1 { 
          margin: 0 0 8px; 
          font-size: 28px; 
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        p { 
          color: #7f8d85; 
          margin: 0 0 32px; 
          font-size: 14px;
          line-height: 1.5;
        }
        input { 
          width: 100%; 
          padding: 12px 14px; 
          border: 1px solid #293630;
          border-radius: 9px; 
          background: #0a100d; 
          color: #eef1ec;
          font-size: 14px; 
          margin-bottom: 16px;
          transition: all 0.2s;
        }
        input:focus {
          outline: none;
          border-color: #57b096;
          background: #0d130f;
          box-shadow: 0 0 0 3px rgba(87, 176, 150, 0.1);
        }
        button { 
          width: 100%; 
          padding: 12px; 
          background: #57b096; 
          color: white;
          border: none; 
          border-radius: 9px; 
          font-size: 14px; 
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        button:hover { 
          background: #6fc4ab;
          transform: translateY(-1px);
        }
        button:active {
          transform: translateY(0);
        }
        .error { 
          color: #e8776b; 
          font-size: 13px; 
          margin-top: 12px; 
          display: none;
          padding: 10px 12px;
          background: rgba(232, 119, 107, 0.1);
          border-radius: 6px;
          border-left: 3px solid #e8776b;
        }
        .info-box {
          background: rgba(87, 176, 150, 0.1);
          border: 1px solid #57b096;
          border-radius: 9px;
          padding: 12px 14px;
          font-size: 13px;
          color: #8fd4bb;
          margin-top: 24px;
          line-height: 1.5;
        }
        .info-box strong { color: #b4f1dd; }
        .divider { 
          border: none; 
          border-top: 1px solid #293630; 
          margin: 24px 0; 
        }
        .viewer-notice {
          background: rgba(87, 176, 150, 0.15);
          border-radius: 9px;
          padding: 16px;
          margin-bottom: 24px;
          border-left: 4px solid #57b096;
        }
        .viewer-notice p {
          margin: 0;
          font-size: 13px;
          color: #8fd4bb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="box">
          <div class="badge">${mode === "editor" ? "🔐 Editor" : mode === "viewer" ? "👁️ Viewer" : "🔒 Restricted"}</div>
          <h1>🌾 Kantex Gullak</h1>
          <p>Business pulse tracker</p>

          ${isViewerAccess ? \`
            <div class="viewer-notice">
              <p><strong>✓ Viewer Access Granted</strong><br>You have read-only access. You can view all data but cannot make changes.</p>
            </div>
            <button onclick="window.location.href='/'">Continue to Dashboard</button>
          \` : \`
            <form id="loginForm">
              <input type="password" id="password" placeholder="Enter editor password" autofocus required>
              <button type="submit">Unlock Dashboard</button>
              <div class="error" id="error">❌ Wrong password. Try again.</div>
            </form>

            <hr class="divider">

            <div class="info-box">
              <strong>👁️ Viewer Access?</strong><br>
              Ask your editor for a viewer link to access in read-only mode.
            </div>
          \`}
        </div>
      </div>

      <script>
        ${!isViewerAccess ? \`
          document.getElementById("loginForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const pass = document.getElementById("password").value;
            const res = await fetch("/auth", {
              method: "POST",
              body: new URLSearchParams({ password: pass })
            });
            if (res.ok) {
              window.location.href = "/";
            } else {
              document.getElementById("error").style.display = "block";
              document.getElementById("password").value = "";
              document.getElementById("password").focus();
            }
          });
        \` : \`\`}
      </script>
    </body>
    </html>
  \`;
}
