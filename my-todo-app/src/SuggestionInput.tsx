import { useState, type ChangeEvent } from 'react';

interface SuggestionInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
}

export function SuggestionInput({ value, onChange, suggestions, placeholder }: SuggestionInputProps) {
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(suggestions); // 入力値が空の場合は全てのサジェストを表示
    }
    setIsSuggestionVisible(true); // 入力値の有無にかかわらずサジェストを表示
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setIsSuggestionVisible(false);
  };

  return (
    <div className="suggestion-input-container">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          setFilteredSuggestions(suggestions); // フォーカス時に全てのサジェストを表示
          setIsSuggestionVisible(true);
        }}
        onBlur={() => setTimeout(() => setIsSuggestionVisible(false), 100)}
        placeholder={placeholder}
        className="task-input"
        autoComplete="off"
      />
      {isSuggestionVisible && filteredSuggestions.length > 0 && (
        <ul className="suggestions-list">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              className="suggestion-item"
              onMouseDown={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
