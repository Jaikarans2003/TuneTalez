'use client';

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Chapter } from '@/firebase/services';

interface ChapterEditorProps {
  chapter: Partial<Chapter>;
  onChange: (chapter: Partial<Chapter>) => void;
  onDelete?: () => void;
  isNew?: boolean;
}

// Tiptap MenuBar component - reused from BookForm
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-600 p-1 flex flex-wrap gap-1 bg-[#333333]">
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-700' : 'bg-[#444444] hover:bg-gray-600'}`}
        title="Heading 1"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-700' : 'bg-[#444444] hover:bg-gray-600'}`}
        title="Heading 2"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`p-1 rounded ${editor.isActive('paragraph') ? 'bg-gray-700' : 'bg-[#444444] hover:bg-gray-600'}`}
        title="Paragraph"
      >
        P
      </button>
      <span className="mx-1 text-gray-500">|</span>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-700' : 'bg-[#444444] hover:bg-gray-600'}`}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-700' : 'bg-[#444444] hover:bg-gray-600'}`}
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1 rounded ${editor.isActive('underline') ? 'bg-gray-700' : 'bg-[#444444] hover:bg-gray-600'}`}
        title="Underline"
      >
        <u>U</u>
      </button>
      <span className="mx-1 text-gray-500">|</span>
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-1 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-700' : 'bg-[#444444] hover:bg-gray-600'}`}
        title="Align left"
      >
        ←
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-1 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-700' : 'bg-[#444444] hover:bg-gray-600'}`}
        title="Align center"
      >
        ↔
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-1 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-700' : 'bg-[#444444] hover:bg-gray-600'}`}
        title="Align right"
      >
        →
      </button>
      <span className="mx-1 text-gray-500">|</span>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-700' : 'bg-[#444444] hover:bg-gray-600'}`}
        title="Bullet list"
      >
        • List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1 rounded ${editor.isActive('orderedList') ? 'bg-gray-700' : 'bg-[#444444] hover:bg-gray-600'}`}
        title="Numbered list"
      >
        1. List
      </button>
      <span className="mx-1 text-gray-500">|</span>
      <button
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        className="p-1 rounded bg-[#444444] hover:bg-gray-600"
        title="Clear formatting"
      >
        Clear
      </button>
    </div>
  );
}

const ChapterEditor = ({ chapter, onChange, onDelete, isNew = false }: ChapterEditorProps) => {
  const [title, setTitle] = useState(chapter.title || '');
  const [content, setContent] = useState(chapter.content || '');
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [titleError, setTitleError] = useState<string>('');
  const [contentError, setContentError] = useState<string>('');

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Write your episode content here...',
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4 text-white',
        dir: 'ltr',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      
      if (!html.trim()) {
        setContentError('Content is required');
      } else {
        setContentError('');
      }

      // Notify parent component of changes
      onChange({
        ...chapter,
        title,
        content: html
      });
    },
    // Fix SSR hydration issues
    immediatelyRender: false,
  });
  
  // Set editor loaded state when editor is ready
  useEffect(() => {
    if (editor) {
      setEditorLoaded(true);
    }
  }, [editor]);

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    if (!newTitle.trim()) {
      setTitleError('Title is required');
    } else {
      setTitleError('');
    }

    // Notify parent component of changes
    onChange({
      ...chapter,
      title: newTitle,
      content
    });
  };

  return (
    <div className="mb-8 p-4 border border-gray-700 rounded-lg bg-[#222222]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">
          {isNew ? 'New Episode' : `Episode: ${title || 'Untitled'}`}
        </h3>
        {onDelete && (
          <button 
            onClick={onDelete}
            className="px-3 py-1 bg-red-800 text-white rounded hover:bg-red-700 transition-colors"
            title="Delete episode"
          >
            Delete
          </button>
        )}
      </div>
      
      {/* Title */}
      <div className="mb-4">
        <label htmlFor={`chapter-title-${chapter.id || 'new'}`} className="block text-sm font-medium text-gray-300 mb-1">
          Episode Title *
        </label>
        <input
          type="text"
          id={`chapter-title-${chapter.id || 'new'}`}
          value={title}
          onChange={handleTitleChange}
          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-[#2a2a2a] text-white"
          placeholder="Enter episode title"
          required
        />
        {titleError && <p className="text-red-500 text-sm mt-1">{titleError}</p>}
      </div>
      
      {/* Content */}
      <div className="mb-2">
        <label htmlFor={`chapter-content-${chapter.id || 'new'}`} className="block text-sm font-medium text-gray-300 mb-1">
          Episode Content *
        </label>
        
        {/* Tiptap Editor */}
        <div className="border border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-primary overflow-hidden">
          {!editorLoaded ? (
            <div className="w-full px-3 py-2 bg-[#2a2a2a] text-white min-h-[300px] flex items-center justify-center">
              <p>Loading editor...</p>
            </div>
          ) : (
            <div className="bg-[#2a2a2a]">
              <MenuBar editor={editor} />
              <EditorContent editor={editor} className="prose-invert" />
            </div>
          )}
        </div>
        {contentError && <p className="text-red-500 text-sm mt-1">{contentError}</p>}
      </div>
    </div>
  );
};

export default ChapterEditor;
