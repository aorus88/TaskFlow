import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../styles/editor.css';

const EditorContent = ({ content, onChange }) => {
  return (
    <div className="editor-content-wrapper">
      <ReactQuill
        value={content}
        onChange={onChange}
        theme="snow"
        placeholder="Écrivez votre note ici..."
      />
    </div>
  );
};

export default EditorContent;
