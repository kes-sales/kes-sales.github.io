# kes-sales.github.io

Sales reporting forms for KES Sales Officials.

Static site on **GitHub Pages**; form storage and voice transcription run in **Google Apps Script** (GAS) only. Weekly reporting from Google Sheets via Pipedream/Python is separate from this form.

## Voice notes (Groq via Google Apps Script)

Each activity’s **What happened?** and **What is the next move?** fields include a **Voice note** button. The browser records audio, sends base64 JSON to your GAS web app (`action: "transcribe"`), GAS calls [Groq Whisper](https://console.groq.com/docs/speech-text) (`whisper-large-v3-turbo`), and the returned text is appended to the textarea. Audio is not stored on the site or in the sheet—only the transcript in `happened` / `next_move` when the user submits the form.

The Groq API key lives only in **GAS Script Properties**, never in `script.js` or GitHub.

> **Note:** Vercel (or similar) would be a simple place to host a transcription proxy, but this project intentionally uses GAS-only so everything stays in Google’s stack with the form handler.

## Google Apps Script setup

Source for the web app is in [`google-apps-script/Code.gs`](google-apps-script/Code.gs).

1. Open [Google Apps Script](https://script.google.com) (new project or your existing KES form project).
2. Paste or sync `Code.gs`. If you already have sheet logic in production, add the `transcribe` branch and `transcribeAudio_` helpers to your existing `doPost` instead of replacing your handler.
3. **Project settings → Script properties**:
   - `GROQ_API_KEY` — from [Groq Console](https://console.groq.com/keys) (required for voice notes).
   - `SPREADSHEET_ID` — Google Sheet ID (only if using the sample `handleSalesReportSubmission_` in the repo).
   - `SHEET_NAME` — tab name (optional; default `Form Responses`).
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the **Web app URL** (`…/macros/s/…/exec`) into `GOOGLE_SCRIPT_URL` in `script.js`, or set the optional `<meta name="google-script-url">` in `index.html` for overrides without editing JS.

After code changes, create a **New deployment** (or manage versions) so the `/exec` URL picks up updates.

## GitHub Pages (production)

1. Push this repo to GitHub (`kes-sales.github.io` or your Pages branch).
2. **Settings → Pages** → deploy from `main` (or `gh-pages`) as applicable.
3. Ensure `script.js` points at the deployed GAS web app URL.
4. Use the site over **HTTPS** (required for microphone access).

## Preview locally (before production)

The form and voice UI are static files; transcription and submit call the **deployed** GAS URL (local GAS is not required).

1. Deploy GAS once (steps above) and set `GROQ_API_KEY`.
2. Point the app at that URL (`GOOGLE_SCRIPT_URL` in `script.js` or `google-script-url` meta).
3. Serve the repo root locally (HTTPS is not required on `localhost` for the mic):

   ```bash
   npx --yes serve .
   ```

   Or:

   ```bash
   python -m http.server 8080
   ```

4. Open `http://localhost:3000` (serve) or `http://localhost:8080` (Python).
5. Test voice notes and a test form submit; confirm rows appear in your sheet (production or a test spreadsheet).

Optional: use [clasp](https://github.com/google/clasp) to push `google-apps-script/` to your script project and deploy from the CLI.

## Limitations

- **Browser:** `MediaRecorder` and microphone permission (Chrome, Edge, Firefox, Safari 14.1+; HTTPS or localhost).
- **Recording length:** Client limits uploads to ~3.5 MB base64 (~2 minutes); Groq allows up to **25 MB** per file.
- **GAS / UrlFetchApp:** Practical payload size is much smaller than the ~50 MB UrlFetch limit once base64 JSON is included; keep voice notes short.
- **GAS runtime:** Max **6 minutes** per execution (transcription is usually seconds).
- **CORS:** Transcription POST uses `Content-Type: text/plain` to reduce preflight issues with GAS web apps. GAS does not expose custom CORS headers; deployment must be **Anyone** and the client uses `mode: 'cors'`.
- **OPTIONS:** GAS web apps do not reliably handle CORS preflight; avoid `application/json` on cross-origin transcribe requests.
- **One recording at a time** across fields.
- **Form submit** uses `no-cors`; success is assumed if the network request completes (same as before).

## Weekly reporting (Pipedream)

Automated weekly summaries from Google Sheets (e.g. a Python `handler(pd)` on Pipedream) are unrelated to voice transcription and form POST handling.
