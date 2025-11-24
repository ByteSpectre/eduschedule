import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { mockGroups, mockTeachers, mockRooms, getTeacherFullName } from '../utils/mockData';

interface SearchResult {
  id: string;
  type: 'group' | 'teacher' | 'room';
  label: string;
  subtitle?: string;
}

interface SearchBarProps {
  onSelect: (result: SearchResult) => void;
  placeholder?: string;
  searchTypes?: Array<'group' | 'teacher' | 'room'>;
}

export function SearchBar({ onSelect, placeholder = 'Поиск по группам, преподавателям, аудиториям...', searchTypes = ['group', 'teacher', 'room'] }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults((prev) => (prev.length === 0 ? prev : []));
      setIsOpen(false);
      return;
    }

    const searchQuery = query.toLowerCase();
    const allResults: SearchResult[] = [];

    // Search groups
    if (searchTypes.includes('group')) {
      mockGroups.forEach(group => {
        if (group.name.toLowerCase().includes(searchQuery)) {
          allResults.push({
            id: group.id,
            type: 'group',
            label: group.name,
            subtitle: `${group.course} курс, ${group.faculty}`,
          });
        }
      });
    }

    // Search teachers
    if (searchTypes.includes('teacher')) {
      mockTeachers.forEach(teacher => {
        const fullName = `${teacher.lastName} ${teacher.firstName} ${teacher.middleName || ''}`.toLowerCase();
        if (fullName.includes(searchQuery)) {
          allResults.push({
            id: teacher.id,
            type: 'teacher',
            label: getTeacherFullName(teacher),
            subtitle: teacher.department,
          });
        }
      });
    }

    // Search rooms
    if (searchTypes.includes('room')) {
      mockRooms.forEach(room => {
        if (room.number.toLowerCase().includes(searchQuery) || room.building.toLowerCase().includes(searchQuery)) {
          allResults.push({
            id: room.id,
            type: 'room',
            label: `Аудитория ${room.number}`,
            subtitle: `${room.building}, вместимость: ${room.capacity}`,
          });
        }
      });
    }

    setResults(allResults.slice(0, 8));
    setIsOpen(allResults.length > 0);
    setSelectedIndex(0);
  }, [query, searchTypes]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    onSelect(result);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const typeIcons = {
    group: '👥',
    teacher: '👨‍🏫',
    room: '🚪',
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 text-lg rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-brand-500 focus:outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-slide-up"
        >
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className={cn(
                'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                index === selectedIndex
                  ? 'bg-brand-50 dark:bg-brand-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">
                {typeIcons[result.type]}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {result.label}
                </div>
                {result.subtitle && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {result.subtitle}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

