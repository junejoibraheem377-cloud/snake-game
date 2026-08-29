* { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #0b1120;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  touch-action: none;
}
#game {
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(160deg, #3ec6e0, #1e9bc2);
}

#leaderboard {
  position: fixed;
  top: 14px;
  left: 14px;
  background: rgba(15,23,42,0.65);
  color: #fff;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 12px;
  min-width: 140px;
  z-index: 5;
}
.lb-title { font-weight: 700; margin-bottom: 6px; color: #34d399; }
#lbList { list-style: none; }
#lbList li { padding: 1px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#lbList li.me { color: #fbbf24; font-weight: 700; }

#scoreBox {
  position: fixed;
  top: 14px;
  right: 14px;
  background: rgba(15,23,42,0.65);
  color: #fff;
  font-size: 28px;
  font-weight: 800;
  padding: 8px 16px;
  border-radius: 10px;
  z-index: 5;
}

#restartBtn {
  position: fixed;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  background: #ef4444;
  color: #fff;
  border: none;
  padding: 8px 18px;
  font-weight: 700;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  z-index: 6;
}
#restartBtn:active { background: #dc2626; }

#overlay {
  position: fixed;
  inset: 0;
  background: rgba(11,17,32,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  text-align: center;
  color: #fff;
  padding: 20px;
}
#overlay.hidden { display: none; }
#overlayInner h1 { color: #34d399; margin-bottom: 10px; font-size: 26px; }
#overlayInner p { color: #cbd5e1; margin-bottom: 18px; font-size: 14px; }
#startBtn {
  background: #10b981;
  color: #0f172a;
  border: none;
  padding: 12px 28px;
  font-weight: 800;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
}
#startBtn:active { background: #34d399; }
