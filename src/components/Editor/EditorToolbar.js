import React from 'react';
import '../../styles/editor.css';

const EditorToolbar = () => {
  return (
    <div id="toolbar" className="ql-toolbar ql-snow editor-toolbar">
      <span className="ql-formats">
        <select className="ql-header">
          <option value="1">Titre 1</option>
          <option value="2">Titre 2</option>
          <option value="3">Titre 3</option>
          <option value="">Normal</option>
        </select>
        <select className="ql-font">
          <option value="sans-serif">Sans Serif</option>
          <option value="serif">Serif</option>
          <option value="monospace">Monospace</option>
        </select>
      </span>
      <span className="ql-formats">
        <button className="ql-bold"></button>
        <button className="ql-italic"></button>
        <button className="ql-underline"></button>
        <button className="ql-strike"></button>
      </span>
      <span className="ql-formats">
        <select className="ql-color"></select>
        <select className="ql-background"></select>
      </span>
      <span className="ql-formats">
        <button className="ql-list" value="ordered"></button>
        <button className="ql-list" value="bullet"></button>
        <button className="ql-indent" value="-1"></button>
        <button className="ql-indent" value="+1"></button>
      </span>
      <span className="ql-formats">
        <button className="ql-link"></button>
        <button className="ql-image"></button>
        <button className="ql-blockquote"></button>
        <button className="ql-clean"></button>
      </span>
    </div>
  );
};

export default EditorToolbar;
