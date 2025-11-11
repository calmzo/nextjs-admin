import React from 'react';

interface TreeDropdownBaseProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
  canClear?: boolean;
  onClear?: (e: React.MouseEvent) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  showSearch?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  triggerContent: React.ReactNode;
  topExtra?: React.ReactNode;
  children: React.ReactNode;
}

const TreeDropdownBase: React.FC<TreeDropdownBaseProps> = ({
  isOpen,
  setIsOpen,
  disabled = false,
  className = '',
  allowClear = true,
  canClear = false,
  onClear,
  containerRef,
  showSearch = true,
  searchValue,
  onSearchChange,
  searchPlaceholder = '搜索...',
  triggerContent,
  topExtra,
  children,
}) => {
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer transition-colors ${
          disabled 
            ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-50' 
            : 'bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
        } ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex-1 min-w-0">
          {triggerContent}
        </div>
        
        <div className="flex items-center gap-2 ml-2">
          {allowClear && canClear && onClear && (
            <button
              onClick={onClear}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {isOpen ? (
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
        >
          {showSearch && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchValue && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSearchChange('');
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto">
            {topExtra}
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeDropdownBase;


