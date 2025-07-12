import React, { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import EmojiPickerReact from 'emoji-picker-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEmojiClick = (emojiObject: any) => {
    onEmojiSelect(emojiObject.emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        title="Insert emoji"
      >
        <Smile className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <EmojiPickerReact
            onEmojiClick={handleEmojiClick}
            width={320}
            height={400}
            searchPlaceholder="Search emojis..."
            skinTonesDisabled
            lazyLoadEmojis
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPicker; 