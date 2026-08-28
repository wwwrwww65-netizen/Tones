import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Quran PDF Caching & Rendering Engine
const quranCacheDir = path.join(__dirname, 'public', 'quran-pages');
if (!fs.existsSync(quranCacheDir)) {
  fs.mkdirSync(quranCacheDir, { recursive: true });
}

let quranPdfDoc: any = null;
let quranTotalPages = 569;
let quranLoadingPromise: Promise<any> | null = null;

async function getQuranDoc() {
  if (quranPdfDoc) return quranPdfDoc;
  if (quranLoadingPromise) return quranLoadingPromise;

  quranLoadingPromise = (async () => {
    try {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const pdfPath = path.join(__dirname, 'mobile-quran.pdf');
      if (fs.existsSync(pdfPath)) {
        const data = new Uint8Array(fs.readFileSync(pdfPath));
        quranPdfDoc = await pdfjsLib.getDocument({ data }).promise;
        quranTotalPages = quranPdfDoc.numPages || 569;
        console.log(`[Quran Engine] Loaded PDF successfully. Total pages: ${quranTotalPages}`);
        
        // Start background pre-rendering
        startBackgroundPreRender();
        return quranPdfDoc;
      }
    } catch (err) {
      console.error('[Quran Engine] Error loading PDF:', err);
    }
    return null;
  })();

  return quranLoadingPromise;
}

// Render a single page on demand and cache to disk
async function renderQuranPage(pageNumber: number): Promise<Buffer | null> {
  const pageFile = path.join(quranCacheDir, `${pageNumber}.jpg`);
  if (fs.existsSync(pageFile)) {
    return fs.readFileSync(pageFile);
  }

  const doc = await getQuranDoc();
  if (!doc || pageNumber < 1 || pageNumber > quranTotalPages) {
    return null;
  }

  try {
    const page = await doc.getPage(pageNumber);
    // 1.55 scale provides sharp text while keeping size compact (~160KB)
    const viewport = page.getViewport({ scale: 1.55 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d');
    
    // Fill white background before rendering
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    await page.render({ canvasContext: ctx, viewport }).promise;
    const buffer = canvas.toBuffer('image/jpeg', 82);
    
    // Save to disk cache asynchronously
    fs.writeFile(pageFile, buffer, () => {});
    return buffer;
  } catch (err) {
    console.error(`[Quran Engine] Failed to render page ${pageNumber}:`, err);
    return null;
  }
}

// Progressive background pre-renderer
let isPreRendering = false;
async function startBackgroundPreRender() {
  if (isPreRendering) return;
  isPreRendering = true;

  // Give priority to initial pages first
  for (let i = 1; i <= quranTotalPages; i++) {
    const pageFile = path.join(quranCacheDir, `${i}.jpg`);
    if (!fs.existsSync(pageFile)) {
      await renderQuranPage(i);
      // Small pause to prevent CPU spikes
      await new Promise(res => setTimeout(res, 35));
    }
  }
  isPreRendering = false;
  console.log('[Quran Engine] All pages pre-rendered and cached to disk.');
}

// Eager load Quran document
getQuranDoc().catch(console.error);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory simulation state for MikroTik Hotspot session
let sessionState = {
  isLoggedIn: false,
  username: 'USER-1234',
  speed: '4M',
  updateOption: '_Uon',
  bytesIn: 14680064,
  bytesOut: 58720256,
  remainBytes: 536870912,
  startTime: Date.now(),
  ip: '192.168.88.25',
  mac: '64:6E:97:A1:B2:C3',
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

// MikroTik Hotspot /login endpoint
app.get('/login', (req, res) => {
  const isCallBack = req.query.var === 'callBack';
  const username = req.query.username as string;
  const domain = (req.query.domain as string) || '4M';

  if (isCallBack) {
    if (username) {
      // Simulate wrong card test cases in preview emulator
      const lower = username.toLowerCase().trim();
      if (lower.startsWith('err') || lower === '000000' || lower === '99887766' || lower === '123' || lower === 'error') {
        let errorMsg = 'invalid username or password';
        if (lower === 'err_used' || lower === '000000') {
          errorMsg = 'simultaneous session limit reached';
        } else if (lower === 'err_mac' || lower === '99887766') {
          errorMsg = 'invalid Calling-Station-Id';
        } else if (lower === 'err_time') {
          errorMsg = 'uptime limit reached';
        } else if (lower === 'err_traffic') {
          errorMsg = 'traffic limit reached';
        }

        return res.json({
          logged_in: 'no',
          error: errorMsg,
          action: 'onLoginError',
        });
      }

      // User is logging in successfully
      sessionState.isLoggedIn = true;
      sessionState.username = username;
      // Support both domain formats: '4M_Uoff' or '4M|*no**'
      if (domain.includes('|')) {
        const parts = domain.split('|');
        sessionState.speed = parts[0] || '4M';
        sessionState.updateOption = parts[1] && parts[1].includes('*no**') ? '_Uoff' : '_Uon';
      } else {
        sessionState.speed = domain.split('_')[0] || '4M';
        sessionState.updateOption = domain.includes('_Uoff') ? '_Uoff' : '_Uon';
      }
      sessionState.startTime = Date.now();

      return res.json({
        logged_in: 'yes',
        username: sessionState.username,
        mac: sessionState.mac,
        link_login_only: '/login',
        sspeed: `${sessionState.speed}_`,
        spes: sessionState.speed,
        update: sessionState.updateOption,
        ip: sessionState.ip,
        bytes_in: String(sessionState.bytesIn),
        bytes_out: String(sessionState.bytesOut),
        remain_bytes_total: String(sessionState.remainBytes),
        session_time_left: '4h30m',
        uptime: getUptimeString(sessionState.startTime),
        session_time_left_secs: '16200',
        uptime_secs: '300',
        trial: 'no',
        login_by: 'username',
        action: 'onLoggedIn',
      });
    }

    // Initial check (before login submitted)
    return res.json({
      logged_in: sessionState.isLoggedIn ? 'yes' : 'no',
      link_login_only: '/login',
      link_logout: '/logout',
      link_status: '/status',
      nas_id: 'BH-NET-MikroTik',
      ip: sessionState.ip,
      mac: sessionState.mac,
      trial: 'no',
      username: sessionState.isLoggedIn ? sessionState.username : '',
      action: 'onLoginStart',
    });
  }

  // Regular direct request
  res.sendFile(path.join(__dirname, 'index.html'));
});

// MikroTik Hotspot /status endpoint
app.get('/status', (req, res) => {
  const isCallBack = req.query.var === 'callBack';

  if (isCallBack) {
    const rawToken = `m056fd9fdfdsffsdffdfd1697455${sessionState.username}dsfd6571fgfgfgfgdf53sdfdsfgsd14`;

    return res.json({
      logged_in: sessionState.isLoggedIn ? 'yes' : 'no',
      mac: sessionState.mac,
      sspeed: `${sessionState.speed}_`,
      spes: sessionState.speed,
      update: sessionState.updateOption,
      ip: sessionState.ip,
      bytes_in: String(sessionState.bytesIn),
      bytes_out: String(sessionState.bytesOut),
      remain_bytes_total: String(sessionState.remainBytes),
      session_time_left: '4h15m',
      uptime: getUptimeString(sessionState.startTime),
      bytesm: rawToken,
      trial: 'no',
      username: sessionState.username,
      action: 'onStatusQuery',
    });
  }

  // Direct page request
  res.sendFile(path.join(__dirname, 'index.html'));
});

// MikroTik Hotspot /logout endpoint
app.get('/logout', (req, res) => {
  sessionState.isLoggedIn = false;
  const isCallBack = req.query.var === 'callBack';

  if (isCallBack) {
    return res.json({
      logged_in: 'no',
      action: 'onLoggedOut',
    });
  }

  res.redirect('/');
});

// Quran Page image renderer endpoint
app.get('/api/quran/page/:page', async (req, res) => {
  const pageNum = parseInt(req.params.page, 10);
  if (isNaN(pageNum) || pageNum < 1 || pageNum > quranTotalPages) {
    return res.status(404).send('Page not found');
  }

  const pageBuffer = await renderQuranPage(pageNum);
  if (!pageBuffer) {
    return res.status(500).send('Error rendering page');
  }

  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(pageBuffer);
});

// Quran Information & Surah list endpoint
app.get('/api/quran/info', (req, res) => {
  const surahsPath = path.join(__dirname, 'js', 'quran-surahs.json');
  let surahs = [];
  if (fs.existsSync(surahsPath)) {
    try {
      surahs = JSON.parse(fs.readFileSync(surahsPath, 'utf-8'));
    } catch (e) {}
  }

  res.json({
    success: true,
    totalPages: quranTotalPages,
    surahs: surahs
  });
});

// Notifications & Announcements API simulation endpoint
app.get('/api/v1/public/content', (req, res) => {
  return res.json({
    success: true,
    data: {
      notifications: [],
      announcements: [],
    },
  });
});

app.get('/api/*', (req, res) => {
  return res.json({
    success: true,
    data: {},
  });
});

// Serve Quran static pre-rendered pages directly from disk
app.use('/quran-pages', express.static(quranCacheDir, {
  maxAge: '30d',
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));
app.use('/public', express.static(path.join(__dirname, 'public'), {
  maxAge: '30d',
  immutable: true
}));

// Dedicated route for Quran PDF file download & inline viewing
app.get(['/mobile-quran.pdf', '/mobile-quran', '/download-quran', '/api/quran/download'], (req, res) => {
  const filePath = path.join(__dirname, 'mobile-quran.pdf');
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('PDF file not found');
  }

  const isDownload = req.query.download === '1' || req.query.dl === '1' || req.path.includes('download');

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Accept-Ranges', 'bytes');

  if (isDownload) {
    return res.download(filePath, 'mobile-quran.pdf', (err) => {
      if (err && !res.headersSent) {
        res.status(500).send('Error downloading file');
      }
    });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="mobile-quran.pdf"');
  res.sendFile(filePath);
});

// Serve static assets from project root and specific subfolders
app.use('/fonts', express.static(path.join(__dirname, 'fonts')));
app.use('/adimg', express.static(path.join(__dirname, 'adimg')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/config', express.static(path.join(__dirname, 'config')));
app.use('/2024', express.static(path.join(__dirname, '2024')));
app.use(express.static(__dirname));

// Fallback route to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Hotspot Server] Running on http://0.0.0.0:${PORT}`);
});
