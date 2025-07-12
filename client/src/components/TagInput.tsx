import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Tag, X } from 'lucide-react';
import axios from 'axios';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
}

const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  placeholder = 'Add tags...',
  maxTags = 5,
  suggestions = []
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, string[]>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Common programming and technology tags for suggestions (fallback)
  const defaultSuggestions = useMemo(() => [
    'javascript', 'python', 'java', 'react', 'nodejs', 'typescript',
    'html', 'css', 'php', 'c++', 'c#', 'ruby', 'go', 'rust',
    'angular', 'vue', 'express', 'django', 'flask', 'spring',
    'mongodb', 'mysql', 'postgresql', 'redis', 'docker', 'kubernetes',
    'aws', 'azure', 'git', 'linux', 'windows', 'macos',
    'algorithm', 'data-structure', 'machine-learning', 'ai', 'blockchain',
    'webpack', 'babel', 'jest', 'cypress', 'selenium', 'graphql'
  ], []);

  const allSuggestions = useMemo(() => 
    Array.from(new Set([...defaultSuggestions, ...suggestions])), 
    [defaultSuggestions, suggestions]
  );

  // Debounced fetch suggestions from API
  const fetchSuggestions = useCallback(async (searchTerm: string): Promise<string[]> => {
    // Check cache first
    if (cache[searchTerm]) {
      return cache[searchTerm];
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`/api/tags/suggestions?search=${searchTerm}&limit=8`);
      if (response.data.success) {
        const suggestions = response.data.data.suggestions;
        // Cache the results
        setCache(prev => ({ ...prev, [searchTerm]: suggestions }));
        return suggestions;
      }
    } catch (error) {
      console.error('Error fetching tag suggestions:', error);
    } finally {
      setIsLoading(false);
    }
    return [];
  }, [cache]);

  // Debounced search function
  const debouncedSearch = useCallback((searchTerm: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (searchTerm.length > 0) {
        const apiSuggestions = await fetchSuggestions(searchTerm);
        if (apiSuggestions.length > 0) {
          setFilteredSuggestions(apiSuggestions);
        } else {
          // Fallback to local suggestions
          const filtered = allSuggestions.filter(suggestion =>
            suggestion.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setFilteredSuggestions(filtered.slice(0, 8));
        }
        setShowSuggestions(true);
      } else {
        setFilteredSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce delay
  }, [fetchSuggestions, allSuggestions]);

  useEffect(() => {
    if (inputValue.startsWith('#')) {
      const searchTerm = inputValue.slice(1).toLowerCase();
      debouncedSearch(searchTerm);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }

    // Cleanup debounce on unmount
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, debouncedSearch]);

  const addTag = useCallback((tag: string) => {
    const cleanTag = tag.toLowerCase().trim();
    if (cleanTag && !value.includes(cleanTag) && value.length < maxTags) {
      onChange([...value, cleanTag]);
      setInputValue('');
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  }, [value, onChange, maxTags]);

  const removeTag = useCallback((tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  }, [value, onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Auto-add tag when space or comma is pressed
    if (newValue.includes(' ') || newValue.includes(',')) {
      const tag = newValue.replace(/[,\s]/g, '').toLowerCase();
      if (tag && !tag.startsWith('#')) {
        addTag(tag);
      }
    }
  }, [addTag]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.startsWith('#')) {
        const tag = inputValue.slice(1).toLowerCase();
        if (tag) {
          addTag(tag);
        }
      } else {
        const tag = inputValue.toLowerCase();
        if (tag) {
          addTag(tag);
        }
      }
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }, [inputValue, addTag, removeTag, value]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    addTag(suggestion);
  }, [addTag]);

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <div className="flex items-center text-gray-400 mr-2">
          <Tag className="h-4 w-4" />
        </div>
        
        {/* Display existing tags */}
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-600 hover:bg-blue-300 focus:outline-none transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={value.length >= maxTags ? 'Maximum tags reached' : placeholder}
          disabled={value.length >= maxTags}
          className="flex-1 min-w-0 border-0 outline-none text-sm placeholder-gray-400 disabled:bg-gray-50"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (filteredSuggestions.length > 0 || isLoading) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">
              Loading suggestions...
            </div>
          ) : (
            filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
              >
                #{suggestion}
              </button>
            ))
          )}
        </div>
      )}

      {/* Helper text */}
      <p className="mt-1 text-sm text-gray-500">
        {value.length}/{maxTags} tags • Type # to see suggestions
      </p>
    </div>
  );
};

export default TagInput; 