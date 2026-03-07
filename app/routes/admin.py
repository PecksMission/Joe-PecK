import os
import re
import json
from datetime import datetime, timezone
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, current_app
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.utils import secure_filename
from ..models import User, Post
from ..extensions import db
from ..renderer import render_editorjs

admin_bp = Blueprint('admin', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')


@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('admin.dashboard'))
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('admin.dashboard'))
        flash('Invalid username or password.', 'error')
    return render_template('admin/login.html')


@admin_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('admin.login'))


@admin_bp.route('/')
@login_required
def dashboard():
    posts = Post.query.order_by(Post.date.desc()).all()
    return render_template('admin/dashboard.html', posts=posts)


@admin_bp.route('/posts/new', methods=['GET', 'POST'])
@login_required
def new_post():
    if request.method == 'POST':
        return save_post(None)
    return render_template('admin/post_edit.html', post=None, mode='editorjs')


@admin_bp.route('/posts/<int:post_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_post(post_id):
    post = Post.query.get_or_404(post_id)
    if request.method == 'POST':
        return save_post(post)
    mode = post.content_type or 'html'
    return render_template('admin/post_edit.html', post=post, mode=mode)


def save_post(post):
    is_new = post is None
    if is_new:
        post = Post()
        db.session.add(post)

    post.title = request.form.get('title', '').strip()
    post.slug = request.form.get('slug', '').strip() or slugify(post.title)
    post.og_title = request.form.get('og_title', '').strip() or None
    post.description = request.form.get('description', '').strip() or None
    post.og_image = request.form.get('og_image', '').strip() or None
    post.tag = request.form.get('tag', '').strip() or None
    post.read_time = request.form.get('read_time', '').strip() or None
    post.excerpt = request.form.get('excerpt', '').strip() or None
    post.comment_key = request.form.get('comment_key', '').strip() or post.slug
    post.is_published = request.form.get('is_published') == 'on'
    post.author_id = current_user.id

    date_str = request.form.get('date', '')
    if date_str:
        post.date = datetime.strptime(date_str, '%Y-%m-%d').date()
    elif is_new:
        post.date = datetime.now(timezone.utc).date()

    content_type = request.form.get('content_type', 'editorjs')
    post.content_type = content_type

    if content_type == 'html':
        post.content_html = request.form.get('content_html', '')
    else:
        editor_data = request.form.get('content_json', '')
        post.content_json = editor_data
        post.content_html = render_editorjs(editor_data)

    post.updated_at = datetime.now(timezone.utc)

    db.session.commit()
    flash('Post saved.', 'success')
    return redirect(url_for('admin.edit_post', post_id=post.id))


@admin_bp.route('/posts/<int:post_id>/delete', methods=['POST'])
@login_required
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    db.session.delete(post)
    db.session.commit()
    flash('Post deleted.', 'success')
    return redirect(url_for('admin.dashboard'))


@admin_bp.route('/upload', methods=['POST'])
@login_required
def upload():
    if 'image' not in request.files:
        return jsonify({'success': 0, 'message': 'No file uploaded'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'success': 0, 'message': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'success': 0, 'message': 'File type not allowed'}), 400

    filename = secure_filename(file.filename)
    # Add timestamp to prevent collisions
    base, ext = os.path.splitext(filename)
    timestamp = int(datetime.now(timezone.utc).timestamp())
    filename = f'{base}_{timestamp}{ext}'

    upload_path = current_app.config['UPLOAD_FOLDER']
    file.save(os.path.join(upload_path, filename))

    url = url_for('static', filename=f'uploads/{filename}')
    return jsonify({
        'success': 1,
        'file': {'url': url}
    })
