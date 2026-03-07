# Peck's Mission — Local Setup Guide (macOS)

## Prerequisites

- **Python 3.10+** (macOS ships with Python 3 via Xcode CLI tools, or install via `brew install python`)
- **Git** (already installed if you're reading this)

Check your Python version:

```bash
python3 --version
```

---

## 1. Clone & Switch to the Branch

```bash
git clone https://github.com/YOUR_USERNAME/Pecks-Mission.git
cd Pecks-Mission
git checkout flask-cms
```

If you already have the repo:

```bash
cd Pecks-Mission
git checkout flask-cms
git pull
```

---

## 2. Create a Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
```

Your terminal prompt should now show `(venv)`. You'll need to run `source venv/bin/activate` each time you open a new terminal.

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs Flask, SQLAlchemy, Flask-Login, bcrypt, BeautifulSoup4, Pillow, and Gunicorn.

---

## 4. Seed the Database

This parses the existing HTML blog posts, extracts their body content, and populates a SQLite database. It also creates the initial admin user.

```bash
python seed.py
```

You should see:

```
Created admin user: joe
  Added blog-post-one: Why I Built This
  Added blog-post-two: What I Found Out This Week
  Added blog-post-three: I Needed You
  Added blog-post-four: Wrestling With Your Living Will
  Added blog-post-five: Memento Mori: What Makes Life Worth Living
  Added blog-post-six: The Walker Is My Bench Press
  Added blog-post-seven: Here I Am. Send Me.

Done. 7 posts in database.
```

The database file lives at `instance/pecksmission.db`. Running the seed script again is safe — it skips posts that already exist.

---

## 5. Start the Dev Server

```bash
flask --app wsgi.py run
```

Or with auto-reload for development:

```bash
flask --app wsgi.py run --debug
```

The site is now running at **http://127.0.0.1:5000**.

> If port 5000 is in use (common on macOS — AirPlay Receiver uses it), use a different port:
>
> ```bash
> flask --app wsgi.py run --port 5001
> ```

---

## 6. Test the Public Pages

Open these URLs in your browser and verify they match the live site:

| URL | What to check |
|-----|---------------|
| http://127.0.0.1:5000/ | Homepage — hero, countdown (post-surgery message), mission grid, post previews |
| http://127.0.0.1:5000/blog.html | Blog listing — all 7 posts + Surgery Day, correct order (newest first) |
| http://127.0.0.1:5000/blog-post-one.html | First post — full body content, quote blocks, parallel table, post nav |
| http://127.0.0.1:5000/blog-post-five.html | Memento Mori — verify comment key is `blog-post-memento-mori` (check browser console for Firebase calls) |
| http://127.0.0.1:5000/about.html | My Story — photo trio, timeline, verse blocks |
| http://127.0.0.1:5000/chiari.html | What is Chiari — medical content, SVG diagrams, callout cards |
| http://127.0.0.1:5000/follow-along.html | Follow Along — contact form, social links, audience cards |
| http://127.0.0.1:5000/surgery-day.html | Surgery Day — served as static HTML (progress board, color-coded timeline) |

### Things to verify on every page

- **Nav** links work and highlight nothing (no active state yet)
- **Hamburger menu** appears on mobile width (resize browser below 768px)
- **Footer** has all links and Kipling quote
- **TL;DR button** appears in bottom-right corner, opens overlay on click
- **Fonts** load: Bebas Neue (headings), Crimson Pro (body), DM Mono (labels)
- **Colors**: dark background (#0a0a0a), gold accents (#c9a84c), cream text (#f5f0e8)

### Things to verify on blog post pages

- **Comments section** ("Leave a thought") loads below the post — Firebase connects and shows existing comments
- **Salute button** works (one per visitor, stored in localStorage)
- **Mailchimp signup** form appears below comments
- **Follow Along popup** triggers after 60 seconds (or was previously dismissed — clear localStorage to test: `localStorage.removeItem('popup-dismissed')`)
- **Post navigation** (Previous / Next) links to correct adjacent posts
- **Images** load correctly (e.g., `Cointoss.webp`, `Walker.webp` — served from project root)

---

## 7. Test the Admin Panel

### Log in

Go to **http://127.0.0.1:5000/admin/login**

```
Username: joe
Password: changeme123
```

### Dashboard

After login you'll land on the dashboard showing all 7 posts with:
- Title, date, tag, content type (`html` for legacy posts)
- **View** button (opens the public post in a new tab)
- **Edit** button
- **+ New Post** button in the header

### Edit a legacy post

1. Click **Edit** on any post (e.g., "Why I Built This")
2. The editor opens in **Raw HTML mode** (legacy posts use `content_type: html`)
3. You'll see the extracted article body HTML in a textarea
4. Try making a small change (add a `<p>Test paragraph</p>` at the end)
5. Click **Save Post**
6. Open the public post URL — verify your change appears
7. Undo the change and save again

### Create a new post

1. Click **+ New Post**
2. The editor opens with **Editor.js** (block editor)
3. Fill in:
   - **Title**: "Test Post"
   - **Date**: today's date
   - **Tag**: Recovery
   - **Read Time**: 2
   - **Excerpt**: "This is a test post."
4. In the editor area, type some content. Try these block types:
   - Regular paragraph (just type)
   - Hit Enter and use the `+` menu or `/` to add blocks:
     - **Header** (h2)
     - **Quote** (gold left border)
     - **Verse** (red left border — Scripture block)
     - **Pull Quote** (centered gold italic)
     - **Delimiter** (gold divider line)
     - **Image** (uploads to `/static/uploads/`)
     - **List** (ordered or unordered)
     - **Opening** (large italic first paragraph)
5. Check **Published**
6. Click **Save Post**
7. Go to http://127.0.0.1:5000/blog.html — your test post should appear at the top
8. Click into it — verify the Editor.js blocks rendered correctly with the right CSS classes

### Upload an image

1. While editing a post in Editor.js mode, add an Image block
2. Click to upload a file (PNG, JPG, JPEG, WEBP, or GIF, max 16MB)
3. The image uploads to `app/static/uploads/` and appears in the editor
4. Save the post and verify the image renders on the public page with grayscale filter and gold border

### Delete the test post

1. Go to the dashboard, click **Edit** on your test post
2. Click the red **Delete** button
3. Confirm the deletion
4. Verify it's gone from the dashboard and blog listing

---

## 8. Test on Mobile

Resize your browser to < 768px wide, or use Chrome DevTools device emulation:

- [ ] Hamburger menu appears, nav links hide
- [ ] Hamburger opens/closes the dropdown menu
- [ ] Blog listing cards stack single-column
- [ ] Post body text has proper padding
- [ ] Admin dashboard and editor are usable (single-column layout, large touch targets)

---

## 9. Reset Everything

If you need to start fresh:

```bash
# Delete the database
rm -rf instance/

# Re-seed
python seed.py
```

If you want to clear uploaded images too:

```bash
rm -f app/static/uploads/*
```

---

## File Locations

| What | Where |
|------|-------|
| Database | `instance/pecksmission.db` |
| Uploaded images | `app/static/uploads/` |
| Legacy images | Project root (`*.webp`, `*.jpg`, `*.jpeg`, etc.) |
| Surgery Day page | `surgery-day.html` (project root, served as-is) |
| CSS | `app/static/css/` (main, post, comments, admin) |
| JS | `app/static/js/` (hamburger, comments, admin/editor) |
| Templates | `app/templates/` (base, public/, admin/, partials/) |

---

## Troubleshooting

### Port 5000 already in use

macOS Monterey+ uses port 5000 for AirPlay Receiver. Either:
- Disable it: System Settings → General → AirDrop & Handoff → AirPlay Receiver → Off
- Use a different port: `flask --app wsgi.py run --port 5001`

### `ModuleNotFoundError: No module named 'flask'`

You're not in the virtual environment. Run:
```bash
source venv/bin/activate
```

### Templates show raw Jinja2 syntax

Make sure you're accessing the site through Flask (`http://127.0.0.1:5000`) and not opening the HTML files directly in the browser.

### Images don't load

Legacy images (e.g., `Cointoss.webp`) are served from the project root via a catch-all route. Make sure the image files exist in the project root directory (they should be there from the original repo).

### Comments don't load

Firebase comments require an internet connection. The browser connects directly to Firestore — Flask doesn't proxy these requests. Check the browser console for Firebase errors.

### Editor.js blocks don't appear in the editor

The Editor.js libraries are loaded from CDN. Check the browser console for network errors. You need an internet connection for the CDN scripts to load.
