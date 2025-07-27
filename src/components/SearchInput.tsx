import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  onSearch: (query: string) => void;
  onNaturalLanguageSearch?: (query: string) => void;
  placeholder?: string;
  isProcessing?: boolean;
}

const SearchInput = ({ onSearch, onNaturalLanguageSearch, placeholder = "Ask me anything about Bengaluru... 🤖", isProcessing = false }: SearchInputProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isProcessing) {
      handleQuerySubmission(query.trim());
    }
  };

  const handleQuerySubmission = (queryText: string) => {
    // Check if this looks like a natural language query
    const lowerQuery = queryText.toLowerCase();
    const isNaturalLanguage = queryText.trim().split(' ').length > 1 || 
                              queryText.includes('?') ||
                              lowerQuery.includes('where') ||
                              lowerQuery.includes('what') ||
                              lowerQuery.includes('show') ||
                              lowerQuery.includes('find') ||
                              lowerQuery.includes('best') ||
                              lowerQuery.includes('good') ||
                              lowerQuery.includes('near') ||
                              lowerQuery.includes('in') ||
                              lowerQuery.includes('party') ||
                              lowerQuery.includes('restaurant') ||
                              lowerQuery.includes('pub') ||
                              lowerQuery.includes('bar') ||
                              lowerQuery.includes('coffee') ||
                              lowerQuery.includes('nightlife') ||
                              lowerQuery.includes('foodie') ||
                              lowerQuery.includes('uncle') ||
                              lowerQuery.includes('paradise') ||
                              lowerQuery.includes('places');
    
    console.log('Query:', queryText, 'Is Natural Language:', isNaturalLanguage);
    
    if (isNaturalLanguage && onNaturalLanguageSearch) {
      onNaturalLanguageSearch(queryText);
    } else {
      onSearch(queryText);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`
          relative bg-surface-glass backdrop-blur-lg rounded-full border border-border/50
          shadow-floating transition-all duration-300 ease-smooth
          ${isFocused ? 'scale-105 shadow-glow border-primary/50' : ''}
        `}>
          {/* Search icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            <Search className={`w-5 h-5 transition-colors duration-300 ${
              isFocused ? 'text-primary' : 'text-muted-foreground'
            }`} />
          </div>
          
          {/* Input field */}
          <Input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={isProcessing}
            className="
              pl-12 pr-12 py-4 h-14 bg-transparent border-none rounded-full
              placeholder:text-muted-foreground/70 text-foreground
              focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
          
          {/* Location/Loading icon */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <MapPin className={`w-5 h-5 transition-colors duration-300 ${
                query ? 'text-primary' : 'text-muted-foreground/50'
              }`} />
            )}
          </div>
        </div>
        
        {/* Floating effect */}
        {isFocused && (
          <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-10 animate-pulse-glow -z-10" />
        )}
      </form>
      
      
    </div>
  );
};

export default SearchInput;