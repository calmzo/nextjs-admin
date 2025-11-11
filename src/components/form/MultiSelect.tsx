import React, { useState, useEffect, useRef } from "react";

interface Option {
  value: string;
  text: string;
  selected: boolean;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  defaultSelected?: string[];
  onChange?: (selected: string[]) => void;
  disabled?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  defaultSelected = [],
  onChange,
  disabled = false,
}) => {
  const [selectedOptions, setSelectedOptions] =
    useState<string[]>(defaultSelected);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 当 defaultSelected 变化时，同步更新内部状态
  useEffect(() => {
    if (Array.isArray(defaultSelected)) {
      // 仅当内容不一致时才更新，避免父组件每次传入新数组引用导致的循环更新
      const isSameLength =
        defaultSelected.length === selectedOptions.length;
      const isSameContent =
        isSameLength &&
        defaultSelected.every((value) => selectedOptions.includes(value));
      if (!isSameContent) {
        setSelectedOptions(defaultSelected);
      }
    }
  }, [defaultSelected, selectedOptions]);

  const toggleDropdown = () => {
    if (disabled || isOpen) return; // 下拉框已打开时，不允许通过点击输入框关闭
    setIsOpen(true); // 只在关闭状态下打开
  };

  const handleSelect = (optionValue: string) => {
    const newSelectedOptions = selectedOptions.includes(optionValue)
      ? selectedOptions.filter((value) => value !== optionValue)
      : [...selectedOptions, optionValue];

    setSelectedOptions(newSelectedOptions);
    if (onChange) onChange(newSelectedOptions);
  };

  const removeOption = (index: number, value: string) => {
    const newSelectedOptions = selectedOptions.filter((opt) => opt !== value);
    setSelectedOptions(newSelectedOptions);
    if (onChange) onChange(newSelectedOptions);
  };

  // 点击外部区域关闭下拉框
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // 如果点击在容器内（包括输入框和下拉框），不关闭
      if (containerRef.current?.contains(target)) {
        return;
      }
      
      // 点击外部区域，关闭下拉框
      setIsOpen(false);
    };

    // 使用捕获阶段监听事件，确保在其他事件处理器之前执行
    document.addEventListener("click", handleClickOutside, true);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [isOpen]);

  const selectedValuesText = selectedOptions.map(
    (value) => options.find((option) => option.value === value)?.text || ""
  );

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-400">
        {label}
      </label>

      <div ref={containerRef} className="relative z-20 inline-block w-full">
        <div className="relative flex flex-col items-center">
          <div onClick={toggleDropdown} className="w-full">
            <div className="mb-2 flex min-h-11 rounded-lg border border-gray-300 py-1.5 pl-3 pr-3 shadow-theme-xs outline-hidden transition focus:border-brand-300 focus:shadow-focus-ring dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-300">
              <div className="flex flex-wrap flex-auto gap-2">
                {selectedValuesText.length > 0 ? (
                  selectedValuesText.map((text, index) => (
                    <div
                      key={index}
                      className="group flex items-center justify-center rounded-full border-[0.7px] border-transparent bg-gray-100 py-1 pl-2.5 pr-2 text-xs text-gray-800 hover:border-gray-200 dark:bg-gray-800 dark:text-white/90 dark:hover:border-gray-800"
                    >
                      <span className="flex-initial max-w-full">{text}</span>
                      <div className="flex flex-row-reverse flex-auto">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            removeOption(index, selectedOptions[index]);
                          }}
                          className="pl-2 text-gray-500 cursor-pointer group-hover:text-gray-400 dark:text-gray-400"
                        >
                          <svg
                            className="fill-current"
                            role="button"
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <input
                    placeholder="请选择角色"
                    className="w-full h-full p-1 pr-2 text-xs bg-transparent border-0 outline-hidden appearance-none text-gray-400 placeholder:text-gray-400 focus:border-0 focus:outline-hidden focus:ring-0 dark:text-gray-500 dark:placeholder:text-gray-500"
                    readOnly
                    value="请选择角色"
                  />
                )}
              </div>
              <div className="flex items-center py-1 pl-1 pr-1 w-7">
                <button
                  type="button"
                  onClick={toggleDropdown}
                  className="w-5 h-5 text-gray-700 outline-hidden cursor-pointer focus:outline-hidden dark:text-gray-400"
                >
                  <svg
                    className={`stroke-current ${isOpen ? "rotate-180" : ""}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {isOpen && (
            <div
              className="absolute left-0 z-40 w-full overflow-y-auto bg-white rounded-lg shadow-sm top-full max-h-48 dark:bg-gray-900 custom-scrollbar"
            >
              <div className="flex flex-col">
                {options.map((option, index) => (
                  <div key={index}>
                    <div
                      className={`w-full cursor-pointer rounded-t border-b border-gray-200 dark:border-gray-800 ${
                        selectedOptions.includes(option.value)
                          ? "bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/30"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(option.value);
                      }}
                    >
                      <div
                        className={`relative flex w-full items-center p-2 ${
                          selectedOptions.includes(option.value)
                            ? "text-brand-700 dark:text-brand-400"
                            : ""
                        }`}
                      >
                        {/* 选中图标 */}
                        {selectedOptions.includes(option.value) && (
                          <div className="flex-shrink-0 w-4 h-4 ml-2 mr-2 flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-brand-600 dark:text-brand-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                        {!selectedOptions.includes(option.value) && (
                          <div className="flex-shrink-0 w-4 h-4 ml-2 mr-2"></div>
                        )}
                        <div className={`leading-6 flex-1 text-xs ${
                          selectedOptions.includes(option.value)
                            ? "font-medium"
                            : "text-gray-800 dark:text-white/90"
                        }`}>
                          {option.text}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiSelect;
