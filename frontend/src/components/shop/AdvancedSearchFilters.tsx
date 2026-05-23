import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
  color?: string;
}

interface FilterCategory {
  id: string;
  label: string;
  options: FilterOption[];
  collapsed?: boolean;
}

interface AdvancedSearchFiltersProps {
  categories: FilterCategory[];
  onSearch: (query: string) => void;
  onFilterChange: (filters: Record<string, string[]>) => void;
  onSortChange: (sort: string) => void;
  isLoading?: boolean;
}

const SORT_OPTIONS = [
  { value: 'relevant', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export function AdvancedSearchFilters({
  categories,
  onSearch,
  onFilterChange,
  onSortChange,
  isLoading = false,
}: AdvancedSearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState('relevant');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map(cat => cat.id))
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    onSearch(query);
  }, [onSearch]);

  const toggleFilter = (categoryId: string, optionId: string) => {
    setActiveFilters(prev => {
      const current = prev[categoryId] || [];
      const updated = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      
      const newFilters = updated.length > 0
        ? { ...prev, [categoryId]: updated }
        : { ...prev };
      delete newFilters[categoryId];
      
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    onSortChange(value);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
    setSortBy('relevant');
    onFilterChange({});
    onSearch('');
    onSortChange('relevant');
  };

  const activeFilterCount = Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
        />
      </motion.div>

      {/* Controls Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 flex-wrap"
      >
        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => handleSort(e.target.value)}
          className="px-4 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer transition-all"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Filter Toggle */}
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          className="gap-2 rounded-lg"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-accent text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            onClick={clearAllFilters}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            Clear all
          </Button>
        )}
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-neutral-200 pt-4 space-y-4"
          >
            {categories.map(category => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-semibold text-sm text-neutral-900">
                    {category.label}
                  </span>
                  <motion.div
                    animate={{ rotate: expandedCategories.has(category.id) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  </motion.div>
                </button>

                {/* Filter Options */}
                <AnimatePresence>
                  {expandedCategories.has(category.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 pl-2"
                    >
                      {category.options.map(option => {
                        const isChecked = activeFilters[category.id]?.includes(option.id) ?? false;
                        return (
                          <motion.label
                            key={option.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleFilter(category.id, option.id)}
                              disabled={isLoading}
                              className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900 cursor-pointer disabled:opacity-50"
                            />
                            <span className="flex-1 text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors">
                              {option.label}
                            </span>
                            {option.count !== undefined && (
                              <span className="text-xs text-neutral-500 ml-auto">
                                ({option.count})
                              </span>
                            )}
                          </motion.label>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
