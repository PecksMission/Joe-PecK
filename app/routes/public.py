import os
from flask import Blueprint, render_template, abort, send_from_directory, current_app
from ..models import Post
from ..renderer import render_editorjs

public_bp = Blueprint('public', __name__)

# Root-level static files (favicon, CNAME, robots.txt, etc.)
ROOT_FILES = {
    'favicon.ico', 'apple-touch-icon.png', 'favicon-32.png',
    'robots.txt', 'sitemap.xml', 'CNAME',
    'google030b5c36849ffd93.html', 'og-image.png', 'icon-512.png',
}

# Image extensions served from project root (legacy image paths)
IMAGE_EXTS = {'.webp', '.jpg', '.jpeg', '.png', '.mp4', '.mov'}


@public_bp.route('/')
@public_bp.route('/index.html')
def index():
    return render_template('public/index.html')


@public_bp.route('/about.html')
def about():
    return render_template('public/about.html')


@public_bp.route('/chiari.html')
def chiari():
    return render_template('public/chiari.html')


@public_bp.route('/follow-along.html')
def follow_along():
    return render_template('public/follow_along.html')


@public_bp.route('/blog.html')
def blog():
    posts = Post.query.filter_by(is_published=True).order_by(Post.date.desc()).all()

    # Build listing entries
    entries = []
    for p in posts:
        entries.append({
            'url': f'/{p.slug}.html',
            'date_str': p.date.strftime('%B %-d, %Y'),
            'tag': p.tag or '',
            'read_time': f'{p.read_time} min read' if p.read_time else '',
            'title': p.title,
            'excerpt': p.excerpt or '',
        })

    # Insert surgery-day after the first post dated after Feb 26
    surgery_entry = {
        'url': '/surgery-day.html',
        'date_str': 'February 26, 2026',
        'tag': 'Surgery',
        'read_time': 'Live Updates',
        'title': 'Surgery Day',
        'excerpt': "Live updates from Vanderbilt. Joe went in for his suboccipital craniectomy, C1 laminectomy, and duraplasty. His family was with him. The full day, documented in real time.",
    }

    # Find insertion point: after all posts dated >= Feb 27, before posts dated <= Feb 26
    from datetime import date
    surgery_date = date(2026, 2, 26)
    insert_idx = 0
    for i, e in enumerate(entries):
        p = posts[i]
        if p.date <= surgery_date:
            insert_idx = i
            break
    else:
        insert_idx = len(entries)

    entries.insert(insert_idx, surgery_entry)

    return render_template('public/blog.html', posts=entries)


@public_bp.route('/surgery-day.html')
def surgery_day():
    root = os.path.dirname(current_app.root_path)
    return send_from_directory(root, 'surgery-day.html')


@public_bp.route('/<slug>.html')
def post(slug):
    # Check if it's a root-level static file
    filename = f'{slug}.html'
    if filename in ROOT_FILES:
        root = os.path.dirname(current_app.root_path)
        return send_from_directory(root, filename)

    p = Post.query.filter_by(slug=slug, is_published=True).first_or_404()

    # Render body HTML
    if p.content_type == 'editorjs':
        body_html = render_editorjs(p.content_json)
    else:
        body_html = p.content_html or ''

    # Get prev/next posts
    all_posts = Post.query.filter_by(is_published=True).order_by(Post.date.asc()).all()
    idx = next((i for i, x in enumerate(all_posts) if x.id == p.id), -1)
    prev_post = all_posts[idx - 1] if idx > 0 else None
    next_post = all_posts[idx + 1] if idx < len(all_posts) - 1 else None

    return render_template('public/post.html',
                           post=p,
                           body_html=body_html,
                           prev_post=prev_post,
                           next_post=next_post,
                           comment_key=p.comment_key or p.slug,
                           tldr_points=[])


# Serve legacy images from project root
@public_bp.route('/<path:filename>')
def legacy_file(filename):
    ext = os.path.splitext(filename)[1].lower()
    root = os.path.dirname(current_app.root_path)

    if ext in IMAGE_EXTS or filename in ROOT_FILES:
        filepath = os.path.join(root, filename)
        if os.path.isfile(filepath):
            return send_from_directory(root, filename)

    abort(404)
