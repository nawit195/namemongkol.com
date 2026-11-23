import React, { useState, useEffect, useRef, useId } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    options: Option[] | string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    searchPlaceholder?: string;
    variant?: 'dark' | 'light';
    ariaLabel?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    className = '',
    disabled = false,
    searchPlaceholder = 'Type to search...',
    variant = 'dark',
    ariaLabel,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listId = useId();

    // Convert options to standard format
    const formattedOptions: Option[] = React.useMemo(() => {
        return options.map(opt =>
            typeof opt === 'string' ? { value: opt, label: opt } : opt
        );
    }, [options]);

    // Find selected label for display
    const selectedOption = formattedOptions.find(opt => opt.value === value);
    const displayValue = selectedOption ? selectedOption.label : '';

    // Filter options based on search term
    const filteredOptions = formattedOptions.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
        triggerRef.current?.focus();
    };

    const isLight = variant === 'light';

    return (
        <div ref={wrapperRef} className={`relative ${className}`} onKeyDown={(event) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        }}>
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                aria-label={ariaLabel || placeholder}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={isOpen ? listId : undefined}
                onClick={() => {
                    if (disabled) return;
                    const nextOpen = !isOpen;
                    setIsOpen(nextOpen);
                    if (nextOpen) {
                        setSearchTerm('');
                    }
                }}
                className={`w-full min-h-12 rounded-xl border px-4 py-3 text-left text-sm flex items-center justify-between gap-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                    ${isLight
                        ? 'border-amber-200/70 bg-[#fefdfb] text-[#1a1a3e] shadow-[0_3px_8px_rgba(201,147,58,0.05)]'
                        : 'border-slate-700/80 bg-slate-900/90 shadow-inner'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : isLight ? 'hover:border-amber-400 hover:bg-amber-50' : 'hover:border-amber-500/40 hover:bg-slate-900'}
                    ${isOpen ? isLight ? 'border-amber-400 ring-2 ring-amber-200/50 bg-[#fefdfb]' : 'border-amber-500/60 ring-2 ring-amber-500/10 bg-slate-900' : ''}
                `}
            >
                <span className={`min-w-0 truncate ${!displayValue ? 'text-slate-500' : isLight ? 'text-[#1a1a3e]' : 'text-white'}`}>
                    {displayValue || placeholder}
                </span>
                <ChevronDown size={16} aria-hidden="true" className={`shrink-0 ${isLight ? 'text-amber-600' : 'text-slate-500'} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && !disabled && (
                <div data-select-menu className={`absolute z-50 w-full mt-2 overflow-hidden rounded-xl border shadow-2xl ${isLight ? 'border-amber-200 bg-[#fefdfb] shadow-amber-950/15' : 'border-slate-800 bg-slate-950 shadow-slate-950/40'}`}>
                    <div className={`p-2 border-b ${isLight ? 'border-amber-100' : 'border-slate-800'}`}>
                        <div className="relative">
                            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-amber-600' : 'text-slate-500'}`} />
                            <input
                                type="text"
                                className={`w-full rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 ${isLight ? 'bg-amber-50/70 text-[#1a1a3e] placeholder:text-slate-500 focus:ring-amber-400' : 'bg-slate-900 text-white placeholder:text-slate-500 focus:ring-amber-500/30'}`}
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    <div id={listId} role="listbox" aria-label={ariaLabel || placeholder} className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    role="option"
                                    aria-selected={opt.value === value}
                                    onClick={() => handleSelect(opt.value)}
                                    className={`w-full min-h-11 px-4 py-2.5 text-left text-sm cursor-pointer transition-colors flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500
                                        ${opt.value === value
                                            ? isLight ? 'bg-amber-100 text-amber-900 font-medium' : 'bg-amber-500/10 text-amber-500 font-medium'
                                            : isLight ? 'text-slate-600 hover:bg-amber-50/70 hover:text-[#1a1a3e]' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                        }
                                    `}
                                >
                                    <span>{opt.label}</span>
                                    {opt.value === value && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                                </button>
                            ))
                        ) : (
                            <div className={`px-4 py-8 text-center text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                ไม่พบข้อมูล
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
