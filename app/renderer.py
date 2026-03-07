"""Render Editor.js JSON blocks to HTML matching the existing post styles."""

import json
from markupsafe import escape


def render_editorjs(content_json):
    """Convert Editor.js JSON string to HTML."""
    if not content_json:
        return ''
    try:
        data = json.loads(content_json) if isinstance(content_json, str) else content_json
    except (json.JSONDecodeError, TypeError):
        return ''

    blocks = data.get('blocks', [])
    html_parts = []

    for block in blocks:
        btype = block.get('type', '')
        bdata = block.get('data', {})
        html_parts.append(render_block(btype, bdata))

    return '\n'.join(html_parts)


def render_block(btype, data):
    """Render a single Editor.js block to HTML."""
    if btype == 'paragraph':
        text = data.get('text', '')
        css_class = ' class="opening"' if data.get('opening') else ''
        return f'<p{css_class}>{text}</p>'

    elif btype == 'header':
        text = data.get('text', '')
        level = data.get('level', 2)
        level = max(2, min(6, level))
        return f'<h{level}>{text}</h{level}>'

    elif btype == 'image':
        url = escape(data.get('file', {}).get('url', data.get('url', '')))
        caption = data.get('caption', '')
        html = '<figure>'
        html += f'<img src="{url}" alt="{escape(caption)}" loading="lazy">'
        if caption:
            html += f'<figcaption>{caption}</figcaption>'
        html += '</figure>'
        return html

    elif btype == 'quote':
        text = data.get('text', '')
        caption = data.get('caption', '')
        html = '<div class="quote-block">'
        html += f'<p class="quote-text">{text}</p>'
        if caption:
            html += f'<p class="quote-attr">{caption}</p>'
        html += '</div>'
        return html

    elif btype == 'verse':
        text = data.get('text', '')
        caption = data.get('caption', '')
        html = '<div class="verse-block">'
        html += f'<p class="verse-text">{text}</p>'
        if caption:
            html += f'<p class="verse-ref">{caption}</p>'
        html += '</div>'
        return html

    elif btype == 'pullquote':
        text = data.get('text', '')
        return f'<div class="pull-quote"><p>{text}</p></div>'

    elif btype == 'delimiter':
        return '<div class="divider"></div>'

    elif btype == 'list':
        style = data.get('style', 'unordered')
        items = data.get('items', [])
        tag = 'ol' if style == 'ordered' else 'ul'
        li_html = ''.join(f'<li>{item}</li>' for item in items)
        return f'<{tag}>{li_html}</{tag}>'

    return ''
