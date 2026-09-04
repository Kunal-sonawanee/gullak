// _middleware.js
export async function onRequest(context) {
  const { request } = context;
  
  // Simple password check
  const PASSWORDS = ["Kunal@2004$"]; // Change this!
  const authHeader = request.headers.get("authorization");
  
  // Allow static assets without auth
  const url = new URL(request.url);
  if (url.pathname.startsWith("/assets")) {
    return context.next();
  }
  // Check cookie or auth header
  const cookie = request.headers.get("cookie") || "";
  if (cookie.includes("gullak_auth=valid")) {
    return context.next();
  }
  // If it's an auth attempt
  if (request.method === "POST" && url.pathname === "/auth") {
    const body = await request.text();
    const pass = new URLSearchParams(body).get("password");
    
    if (PASSWORDS.includes(pass)) {
      return new Response("OK", {
        status: 200,
        headers: {
          "Set-Cookie": "gullak_auth=valid; Max-Age=2592000; Path=/; HttpOnly; SameSite=Strict"
        }
      });
    }
    return new Response("Unauthorized", { status: 401 });
  }
  // Show login form
  if (request.method === "GET") {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kantex Gullak — Login</title>
        <style>
          body { font-family: system-ui; background: #0e1512; color: #eef1ec; 
                  display: flex; align-items: center; justify-content: center; 
                  height: 100vh; margin: 0; }
          .box { background: #161f1a; border: 1px solid #293630; border-radius: 18px;
                 padding: 32px; width: 100%; max-width: 320px; }
          h1 { margin: 0 0 8px; font-size: 24px; }
          p { color: #7f8d85; margin: 0 0 24px; font-size: 14px; }
          input { width: 100%; padding: 10px 12px; border: 1px solid #293630;
                  border-radius: 9px; background: #0a100d; color: #eef1ec;
                  font-size: 14px; box-sizing: border-box; margin-bottom: 12px; }
          button { width: 100%; padding: 10px; background: #57b096; color: #fff;
                   border: none; border-radius: 9px; font-size: 14px; font-weight: 600;
                   cursor: pointer; }
          button:hover { background: #8fd4bb; }
          .error { color: #e8776b; font-size: 12px; margin-top: 8px; display: none; }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>🌾 Kantex Gullak</h1>
          <p>Business pulse tracker</p>
          <form id="loginForm">
            <input type="password" id="password" placeholder="Enter password" autofocus required>
            <button type="submit">Unlock</button>
            <div class="error" id="error">Wrong password</div>
          </form>
        </div>
        <script>
          document.getElementById("loginForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const pass = document.getElementById("password").value;
            const res = await fetch("/auth", {
              method: "POST",
              body: new FormData(new FormData(e.target))
            });
            if (res.ok) {
              window.location.href = "/";
            } else {
              document.getElementById("error").style.display = "block";
              document.getElementById("password").value = "";
            }
          });
        </script>
      </body>
      </html>
    `;
    return new Response(html, { headers: { "Content-Type": "text/html" } });
  }
  return context.next();
}
