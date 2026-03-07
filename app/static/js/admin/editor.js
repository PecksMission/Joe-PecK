/**
 * Custom Editor.js blocks for Peck's Mission
 */

// Verse Block (Scripture — red left border)
class VerseTool {
  static get toolbox() {
    return { title: 'Verse', icon: '<svg width="17" height="15" viewBox="0 0 17 15"><text x="0" y="12" font-size="14" fill="currentColor">✝</text></svg>' };
  }
  constructor({ data }) {
    this.data = data || {};
  }
  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.style.cssText = 'background:rgba(139,32,32,0.08);border-left:3px solid #8b2020;padding:12px 16px;margin:8px 0;';

    this.textInput = document.createElement('div');
    this.textInput.contentEditable = true;
    this.textInput.style.cssText = 'font-style:italic;color:#f5f0e8;font-size:15px;line-height:1.6;outline:none;min-height:20px;';
    this.textInput.setAttribute('data-placeholder', 'Scripture text...');
    this.textInput.innerHTML = this.data.text || '';

    this.captionInput = document.createElement('div');
    this.captionInput.contentEditable = true;
    this.captionInput.style.cssText = 'font-family:monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#9a9a9a;margin-top:8px;outline:none;';
    this.captionInput.setAttribute('data-placeholder', '— Book Chapter:Verse');
    this.captionInput.innerHTML = this.data.caption || '';

    this.wrapper.appendChild(this.textInput);
    this.wrapper.appendChild(this.captionInput);
    return this.wrapper;
  }
  save() {
    return { text: this.textInput.innerHTML, caption: this.captionInput.innerHTML };
  }
}

// Pull Quote Block (centered gold italic)
class PullQuoteTool {
  static get toolbox() {
    return { title: 'Pull Quote', icon: '<svg width="17" height="15" viewBox="0 0 17 15"><text x="0" y="12" font-size="14" fill="currentColor">"</text></svg>' };
  }
  constructor({ data }) {
    this.data = data || {};
  }
  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.style.cssText = 'text-align:center;padding:16px;border-top:1px solid rgba(201,168,76,0.15);border-bottom:1px solid rgba(201,168,76,0.15);margin:8px 0;';

    this.textInput = document.createElement('div');
    this.textInput.contentEditable = true;
    this.textInput.style.cssText = 'font-style:italic;color:#c9a84c;font-size:18px;line-height:1.5;outline:none;min-height:20px;';
    this.textInput.setAttribute('data-placeholder', 'Pull quote text...');
    this.textInput.innerHTML = this.data.text || '';

    this.wrapper.appendChild(this.textInput);
    return this.wrapper;
  }
  save() {
    return { text: this.textInput.innerHTML };
  }
}

// Opening Paragraph (toggle for the large italic first paragraph)
class OpeningParagraphTool {
  static get toolbox() {
    return { title: 'Opening', icon: '<svg width="17" height="15" viewBox="0 0 17 15"><text x="0" y="12" font-size="14" fill="currentColor">P</text></svg>' };
  }
  constructor({ data }) {
    this.data = data || {};
  }
  render() {
    this.wrapper = document.createElement('div');
    this.textInput = document.createElement('div');
    this.textInput.contentEditable = true;
    this.textInput.style.cssText = 'font-style:italic;color:#f5f0e8;font-size:16px;line-height:1.7;outline:none;min-height:20px;';
    this.textInput.setAttribute('data-placeholder', 'Opening paragraph...');
    this.textInput.innerHTML = this.data.text || '';
    this.wrapper.appendChild(this.textInput);
    return this.wrapper;
  }
  save() {
    return { text: this.textInput.innerHTML, opening: true };
  }
  static get conversionConfig() {
    return { export: 'text', import: 'text' };
  }
}

// Initialize Editor.js
(function() {
  var existingData = document.getElementById('content_json');
  var initialData = null;
  if (existingData && existingData.value) {
    try { initialData = JSON.parse(existingData.value); } catch(e) {}
  }

  var config = {
    holder: 'editorjs',
    placeholder: 'Start writing...',
    tools: {
      header: { class: Header, config: { levels: [2, 3], defaultLevel: 2 } },
      list: { class: List },
      quote: { class: Quote, config: { quotePlaceholder: 'Quote text...', captionPlaceholder: '— Attribution' } },
      delimiter: { class: Delimiter },
      image: {
        class: ImageTool,
        config: {
          endpoints: { byFile: '/admin/upload' },
          field: 'image',
          types: 'image/png, image/jpeg, image/webp, image/gif'
        }
      },
      verse: { class: VerseTool },
      pullquote: { class: PullQuoteTool },
      opening: { class: OpeningParagraphTool }
    }
  };

  if (initialData && initialData.blocks && initialData.blocks.length > 0) {
    config.data = initialData;
  }

  window.editorInstance = new EditorJS(config);
})();
