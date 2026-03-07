"""
Seed script: Parse existing HTML blog posts and populate the database.
Usage: python seed.py
"""

import os
import re
import sys
from datetime import date

# Add project root to path
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from app.extensions import db
from app.models import User, Post

# Post metadata — extracted from existing HTML files
POSTS = [
    {
        'slug': 'blog-post-one',
        'title': 'Why I Built This',
        'og_title': 'Why I Built This',
        'description': "I was a good medic. But I had never been a patient — and I didn't know how wide that gap was until I ended up on the other side of it.",
        'og_image': 'https://www.pecksmission.com/og-image.png',
        'date': date(2026, 2, 18),
        'tag': 'Diagnosis',
        'read_time': '4',
        'excerpt': "I was a good medic. But I had never been a patient — and I didn't know how wide that gap was until I ended up on the other side of it.",
        'comment_key': 'blog-post-one',
    },
    {
        'slug': 'blog-post-two',
        'title': 'What I Found Out This Week',
        'og_title': 'What I Found Out This Week',
        'description': "On Tuesday, I walked into a neurosurgeon's office with a cowboy's gait, thinking it was high noon and feeling ready for a duel.",
        'og_image': 'https://www.pecksmission.com/og-image.png',
        'date': date(2026, 2, 19),
        'tag': 'Diagnosis',
        'read_time': '5',
        'excerpt': "On Tuesday, I walked into a neurosurgeon's office with a cowboy's gait, thinking it was high noon and feeling ready for a duel. I didn't know exactly why I felt like that. I just knew something was different.",
        'comment_key': 'blog-post-two',
    },
    {
        'slug': 'blog-post-three',
        'title': 'I Needed You',
        'og_title': 'I Needed You',
        'description': "I took a leap of faith. I was the most vulnerable I've ever been online. I showed every ounce of myself — and my community showed up and showed out.",
        'og_image': 'https://www.pecksmission.com/og-image.png',
        'date': date(2026, 2, 20),
        'tag': 'Community',
        'read_time': '4',
        'excerpt': "I took a leap of faith. I was the most vulnerable I've ever been online. I showed every ounce of myself — and my community showed up and showed out. Surgery is in five days.",
        'comment_key': 'blog-post-three',
    },
    {
        'slug': 'blog-post-four',
        'title': 'Wrestling With Your Living Will',
        'og_title': 'Wrestling With Your Living Will',
        'description': "Before I go into surgery, I had to wrestle with the hardest document I've ever filled out — a living will.",
        'og_image': 'https://www.pecksmission.com/og-image.png',
        'date': date(2026, 2, 21),
        'tag': 'Faith',
        'read_time': '9',
        'excerpt': "Before I go into surgery, I had to wrestle with the hardest document I've ever filled out — a living will. This is what I decided, and why.",
        'comment_key': 'blog-post-four',
    },
    {
        'slug': 'blog-post-five',
        'title': 'Memento Mori: What Makes Life Worth Living',
        'og_title': 'Memento Mori: What Makes Life Worth Living',
        'description': "I sent my living will off into the abyss a few days ago. And I realized — that document isn't about how I want to end things. It's about how I want to live.",
        'og_image': 'https://www.pecksmission.com/og-image.png',
        'date': date(2026, 2, 24),
        'tag': 'Faith',
        'read_time': '10',
        'excerpt': "I sent my living will off into the abyss a few days ago. And I realized — that document isn't about how I want to end things. It's about how I want to live.",
        'comment_key': 'blog-post-memento-mori',
    },
    {
        'slug': 'blog-post-six',
        'title': 'The Walker Is My Bench Press',
        'og_title': 'The Walker Is My Bench Press',
        'description': "Five days out of brain surgery. Tremors. A walker. My mom cutting up my food. And I'm going to run a marathon.",
        'og_image': 'https://www.pecksmission.com/og-image.png',
        'date': date(2026, 3, 4),
        'tag': 'Recovery',
        'read_time': '6',
        'excerpt': "Five days out of brain surgery. Tremors. A walker. My mom cutting up my food. And I'm going to run a marathon. Here's what it actually looks like from the other side.",
        'comment_key': 'blog-post-six',
    },
    {
        'slug': 'blog-post-seven',
        'title': 'Here I Am. Send Me.',
        'og_title': 'Here I Am. Send Me.',
        'description': "Three days out of brain surgery. I can barely walk. But I know exactly what I'm supposed to do.",
        'og_image': 'https://www.pecksmission.com/og-image.png',
        'date': date(2026, 3, 3),
        'tag': 'Faith',
        'read_time': '5',
        'excerpt': "Three days out of brain surgery. I can barely walk. But I know exactly what I'm supposed to do.",
        'comment_key': 'blog-post-four',  # Reuses blog-post-four's key (intentional bug preserved)
    },
]


def extract_body(html_path):
    """Extract the article body from a blog post HTML file."""
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find content between <article class="post-body"> and </article>
    match = re.search(
        r'<article\s+class="post-body">(.*?)</article>',
        content,
        re.DOTALL
    )
    if match:
        return match.group(1).strip()

    return ''


def seed():
    app = create_app()
    with app.app_context():
        db.create_all()

        # Create admin user if not exists
        if not User.query.filter_by(username='joe').first():
            user = User(
                username='joe',
                display_name='Joe Peck',
                email='joe@pecksmission.com',
            )
            user.set_password('changeme123')
            db.session.add(user)
            db.session.commit()
            print('Created admin user: joe')
        else:
            print('Admin user already exists')

        user = User.query.filter_by(username='joe').first()
        root = os.path.dirname(__file__)

        for post_data in POSTS:
            slug = post_data['slug']

            # Skip if already exists
            if Post.query.filter_by(slug=slug).first():
                print(f'  Skipping {slug} (already exists)')
                continue

            html_path = os.path.join(root, f'{slug}.html')
            body_html = extract_body(html_path) if os.path.exists(html_path) else ''

            post = Post(
                slug=slug,
                title=post_data['title'],
                og_title=post_data['og_title'],
                description=post_data['description'],
                og_image=post_data['og_image'],
                date=post_data['date'],
                tag=post_data['tag'],
                read_time=post_data['read_time'],
                excerpt=post_data['excerpt'],
                content_type='html',
                content_html=body_html,
                comment_key=post_data['comment_key'],
                is_published=True,
                author_id=user.id,
            )
            db.session.add(post)
            print(f'  Added {slug}: {post_data["title"]}')

        db.session.commit()
        print(f'\nDone. {Post.query.count()} posts in database.')


if __name__ == '__main__':
    seed()
