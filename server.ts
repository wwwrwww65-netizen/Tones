import fs from 'fs';
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Internal AI Studio Control Plane endpoint for IDE file operations
app.all(["/__aistudio_internal_control_plane/fs/read*", "/__aistudio_internal_control_plane/*"], (req, res, next) => {
  if (!req.originalUrl.includes("fs/read")) {
    return next();
  }
  try {
    const rawPath = String(req.query.path || req.path.replace(/.*fs\/read\/?/, "") || "");
    const cleanPath = decodeURIComponent(rawPath).replace(/^\/+/, "");
    
    const searchDirs = [
      process.cwd(),
      path.join(process.cwd(), "soma"),
      path.join(process.cwd(), "soma", "lv"),
      __dirname
    ];

    if (cleanPath) {
      for (const dir of searchDirs) {
        const candidate1 = path.resolve(dir, cleanPath);
        if (fs.existsSync(candidate1) && fs.statSync(candidate1).isFile()) {
          return res.status(200).type("text/plain; charset=utf-8").send(fs.readFileSync(candidate1, "utf8"));
        }
        const candidate2 = path.resolve(dir, path.basename(cleanPath));
        if (fs.existsSync(candidate2) && fs.statSync(candidate2).isFile()) {
          return res.status(200).type("text/plain; charset=utf-8").send(fs.readFileSync(candidate2, "utf8"));
        }
      }
    }
    return res.status(200).type("text/plain; charset=utf-8").send("");
  } catch (err: any) {
    return res.status(200).type("text/plain; charset=utf-8").send("");
  }
});




// In-memory simulation state for MikroTik Hotspot session
let sessionState = {
  isLoggedIn: false,
  username: "USER-1234",
  speed: "256k/700k",
  updateOption: "_Uon",
  bytesIn: 14680064,
  bytesOut: 58720256,
  remainBytes: 536870912,
  startTime: Date.now(),
  ip: "192.168.88.25",
  mac: "64:6E:97:A1:B2:C3",
};

// Periodic simulated traffic increments if logged in
setInterval(() => {
  if (sessionState.isLoggedIn) {
    sessionState.bytesIn += Math.floor(Math.random() * 45000) + 5000;
    sessionState.bytesOut += Math.floor(Math.random() * 95000) + 15000;
    if (sessionState.remainBytes > 0) {
      sessionState.remainBytes = Math.max(0, sessionState.remainBytes - 120000);
    }
  }
}, 2000);

// Helper to format uptime into Arabic-friendly / Hotspot-friendly string
function getUptimeString(startTime: number): string {
  const diffSecs = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(diffSecs / 3600);
  const minutes = Math.floor((diffSecs % 3600) / 60);
  const seconds = diffSecs % 60;
  if (hours > 0) return `${hours}h${minutes}m${seconds}s`;
  if (minutes > 0) return `${minutes}m${seconds}s`;
  return `${seconds}s`;
}

// 1. Static Assets & File Serving (MUST BE FIRST so IDE, direct file requests, and assets load directly without 302 redirects)
app.use(express.static(__dirname));
app.use("/fonts", express.static(path.join(__dirname, "fonts")));
app.use("/adimg", express.static(path.join(__dirname, "adimg")));
app.use("/img", express.static(path.join(__dirname, "img")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/config", express.static(path.join(__dirname, "config")));
app.use("/2024", express.static(path.join(__dirname, "2024")));

// Serve all static html files directly when requested as .html files
app.get("*.html", (req, res, next) => {
  const cleanPath = req.path.replace(/^\/+/, "");
  const searchCandidates = [
    path.resolve(__dirname, cleanPath),
    path.resolve(__dirname, "soma", cleanPath),
    path.resolve(__dirname, "soma", "lv", cleanPath)
  ];
  for (const f of searchCandidates) {
    if (fs.existsSync(f) && fs.statSync(f).isFile()) {
      return res.sendFile(f);
    }
  }
  next();
});

// Direct Preview Routes for Hotspot Transition Pages
app.get("/preview/:page", (req, res) => {
  const pageName = `${req.params.page.replace(/\.html$/, "")}.html`;
  const filePath = path.resolve(__dirname, pageName);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }
  return res.redirect("/login");
});

// Root dispatcher
app.get(["/", "/index"], (req, res) => {
  if (sessionState.isLoggedIn) {
    return res.redirect("/status");
  }
  return res.redirect("/login");
});

// MikroTik Hotspot /login endpoint
app.all("/login", (req, res) => {
  const isCallBack = req.query.var === "callBack";
  const usernameParam = (req.body?.username || req.query.username) as string;
  const username = usernameParam ? usernameParam.trim() : "";
  const domain = ((req.body?.domain || req.query.domain) as string) || "256k/700k";

  if (req.method === "POST") {
    if (username) {
      sessionState.isLoggedIn = true;
      sessionState.username = username;
      sessionState.speed = domain.split("_")[0] || "256k/700k";
      sessionState.updateOption = domain.includes("_Uoff") ? "_Uoff" : "_Uon";
      sessionState.startTime = Date.now();
    }
    return res.redirect("/status");
  }

  if (isCallBack) {
    if (username) {
      sessionState.isLoggedIn = true;
      sessionState.username = username;
      sessionState.speed = domain.split("_")[0] || "256k/700k";
      sessionState.updateOption = domain.includes("_Uoff") ? "_Uoff" : "_Uon";
      sessionState.startTime = Date.now();
      return res.json({
        logged_in: "yes",
        username: sessionState.username,
        mac: sessionState.mac,
        link_login_only: "/login",
        sspeed: `${sessionState.speed}_`,
        update: sessionState.updateOption,
        ip: sessionState.ip,
        bytes_in: String(sessionState.bytesIn),
        bytes_out: String(sessionState.bytesOut),
        remain_bytes_total: String(sessionState.remainBytes),
        session_time_left: "4h30m",
        uptime: getUptimeString(sessionState.startTime),
        session_time_left_secs: "16200",
        uptime_secs: "300",
        trial: "no",
        login_by: "username",
        action: "onLoggedIn",
      });
    }

    return res.json({
      logged_in: sessionState.isLoggedIn ? "yes" : "no",
      link_login_only: "/login",
      link_logout: "/logout",
      link_status: "/status",
      nas_id: "SomaNet-MikroTik",
      ip: sessionState.ip,
      mac: sessionState.mac,
      trial: "no",
      username: sessionState.isLoggedIn ? sessionState.username : "",
      action: "onLoginStart",
    });
  }

  if (sessionState.isLoggedIn) {
    return res.redirect("/status");
  }
  res.sendFile(path.join(__dirname, "login.html"));
});

// MikroTik Hotspot /status endpoint
app.all("/status", (req, res) => {
  const isCallBack = req.query.var === "callBack";
  if (isCallBack) {
    const rawToken = `m056fd9fdfdsffsdffdfd1697455${sessionState.username}dsfd6571fgfgfgfgdf53sdfdsfgsd14`;
    return res.json({
      logged_in: sessionState.isLoggedIn ? "yes" : "no",
      mac: sessionState.mac,
      sspeed: `${sessionState.speed}_`,
      update: sessionState.updateOption,
      ip: sessionState.ip,
      bytes_in: String(sessionState.bytesIn),
      bytes_out: String(sessionState.bytesOut),
      remain_bytes_total: String(sessionState.remainBytes),
      session_time_left: "4h15m",
      uptime: getUptimeString(sessionState.startTime),
      bytesm: rawToken,
      trial: "no",
      username: sessionState.username,
      action: "onStatusQuery",
    });
  }

  if (!sessionState.isLoggedIn) {
    return res.redirect("/login");
  }
  res.sendFile(path.join(__dirname, "status.html"));
});

// MikroTik Hotspot /redirect and /rlogin endpoints
app.all(["/redirect", "/rlogin", "/rstatus", "/radvert"], (req, res) => {
  if (sessionState.isLoggedIn) {
    return res.redirect("/status");
  }
  res.redirect("/login");
});

// MikroTik Hotspot /alogin endpoint
app.all("/alogin", (req, res) => {
  const isCallBack = req.query.var === "callBack";
  if (isCallBack) {
    return res.json({
      logged_in: sessionState.isLoggedIn ? "yes" : "no",
      username: sessionState.username,
      mac: sessionState.mac,
      link_login_only: "/login",
      sspeed: `${sessionState.speed}_`,
      update: sessionState.updateOption,
      ip: sessionState.ip,
      bytes_in: String(sessionState.bytesIn),
      bytes_out: String(sessionState.bytesOut),
      remain_bytes_total: String(sessionState.remainBytes),
      session_time_left: "4h30m",
      uptime: getUptimeString(sessionState.startTime),
      session_time_left_secs: "16200",
      uptime_secs: "300",
      trial: "no",
      login_by: "username",
      action: "onLoggedIn",
    });
  }
  return res.redirect(sessionState.isLoggedIn ? "/status" : "/login");
});

// MikroTik Hotspot /logout endpoint
app.all(["/logout", "/$(link-logout)", "/%24(link-logout)", "*/link-logout*"], (req, res) => {
  sessionState.isLoggedIn = false;
  const isCallBack = req.query.var === "callBack";
  if (isCallBack) {
    return res.json({
      logged_in: "no",
      action: "onLoggedOut",
    });
  }
  const savedUser = (req.query?.username || req.body?.username) as string;
  if (savedUser && savedUser !== "-") {
    return res.redirect(`/login?username=${encodeURIComponent(savedUser)}`);
  }
  res.redirect("/login");
});

// Serve root static directory
app.use(express.static(__dirname));

// Fallback route
app.get("*", (req, res) => {
  if (req.path.endsWith(".css") || req.path.endsWith(".js")) {
    return res.status(404).send("File not found");
  }
  if (sessionState.isLoggedIn) {
    return res.redirect("/status");
  }
  return res.redirect("/login");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Hotspot Server] Running on http://0.0.0.0:${PORT}`);
});
