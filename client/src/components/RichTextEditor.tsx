import React, { useMemo, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';
import EmojiPicker from './EmojiPicker';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your content here...',
  className = ''
}) => {
  const quillRef = useRef<ReactQuill>(null);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: () => {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = () => {
            const file = input.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                const range = quillRef.current?.getEditor().getSelection();
                if (range) {
                  quillRef.current?.getEditor().insertEmbed(range.index, 'image', reader.result);
                }
              };
              reader.readAsDataURL(file);
            }
          };
        }
      }
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];

  const handleEmojiSelect = (emoji: string) => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection();
      if (range) {
        // Insert emoji at current cursor position
        editor.insertText(range.index, emoji);
        // Move cursor after the emoji
        editor.setSelection(range.index + emoji.length, 0);
      } else {
        // If no selection, insert at the end
        const length = editor.getLength();
        editor.insertText(length - 1, emoji);
        editor.setSelection(length + emoji.length - 1, 0);
      }
    }
  };

  // Add image removal functionality
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      // Add custom image handler for better sizing and removal
      const originalImageHandler = modules.toolbar.handlers.image;
      modules.toolbar.handlers.image = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
          const file = input.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              const range = editor.getSelection();
              if (range) {
                // Insert the image first
                editor.insertEmbed(range.index, 'image', reader.result);
                
                // Then wrap it with removal functionality
                setTimeout(() => {
                  const insertedImage = editor.root.querySelector(`img[src="${reader.result}"]`) as HTMLImageElement;
                  if (insertedImage) {
                    // Create wrapper
                    const imageWrapper = document.createElement('div');
                    imageWrapper.className = 'image-wrapper';
                    imageWrapper.style.cssText = `
                      position: relative;
                      display: inline-block;
                      max-width: 100%;
                      margin: 10px 0;
                      border-radius: 8px;
                      overflow: hidden;
                    `;

                    // Style the image
                    insertedImage.style.cssText = `
                      max-width: 100%;
                      max-height: 400px;
                      height: auto;
                      display: block;
                      margin: 0;
                    `;

                    // Create remove button
                    const removeBtn = document.createElement('button');
                    removeBtn.innerHTML = '×';
                    removeBtn.className = 'image-remove-btn';
                    removeBtn.style.cssText = `
                      position: absolute;
                      top: 8px;
                      right: 8px;
                      width: 24px;
                      height: 24px;
                      border-radius: 50%;
                      background: rgba(239, 68, 68, 0.9);
                      color: white;
                      border: none;
                      cursor: pointer;
                      font-size: 14px;
                      font-weight: bold;
                      display: none;
                      z-index: 10;
                      backdrop-filter: blur(4px);
                      transition: all 0.2s ease;
                    `;

                    removeBtn.onmouseenter = () => {
                      removeBtn.style.background = 'rgba(220, 38, 38, 0.9)';
                      removeBtn.style.transform = 'scale(1.1)';
                    };

                    removeBtn.onmouseleave = () => {
                      removeBtn.style.background = 'rgba(239, 68, 68, 0.9)';
                      removeBtn.style.transform = 'scale(1)';
                    };

                    removeBtn.onclick = (e) => {
                      e.stopPropagation();
                      imageWrapper.remove();
                    };

                    // Move image to wrapper
                    insertedImage.parentNode?.insertBefore(imageWrapper, insertedImage);
                    imageWrapper.appendChild(insertedImage);
                    imageWrapper.appendChild(removeBtn);

                    // Show/hide remove button on hover
                    imageWrapper.onmouseenter = () => {
                      removeBtn.style.display = 'block';
                    };
                    imageWrapper.onmouseleave = () => {
                      removeBtn.style.display = 'none';
                    };
                  }
                }, 10);
              }
            };
            reader.readAsDataURL(file);
          }
        };
      };
    }
  }, [modules.toolbar.handlers]);

  return (
    <div className={`rich-text-editor ${className}`}>
      <div className="flex items-center justify-end p-2 bg-gray-50 border-b border-gray-300 rounded-t-md">
        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
      </div>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ height: '300px' }}
      />
    </div>
  );
};

export default RichTextEditor; 