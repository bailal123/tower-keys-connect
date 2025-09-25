import React, { useState, useRef, useEffect } from 'react'

export interface Option {
  value: string
  label: string
}

interface CreatableSelectProps {
  options: Option[]
  value?: Option[]
  onChange: (selected: Option[]) => void
  placeholder?: string
  isMulti?: boolean
  isDisabled?: boolean
}

const CreatableSelect: React.FC<CreatableSelectProps> = ({
  options,
  value = [],
  onChange,
  placeholder = "اختر...",
  isMulti = false,
  isDisabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [availableOptions, setAvailableOptions] = useState(options)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setAvailableOptions(options)
  }, [options])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setInputValue('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectOption = (option: Option) => {
    if (isMulti) {
      const newValue = value.some(v => v.value === option.value)
        ? value.filter(v => v.value !== option.value)
        : [...value, option]
      onChange(newValue)
    } else {
      onChange([option])
      setIsOpen(false)
    }
    setInputValue('')
  }

  const handleCreateOption = () => {
    if (inputValue.trim() && !availableOptions.some(opt => opt.value === inputValue.trim())) {
      const newOption: Option = {
        value: inputValue.trim(),
        label: inputValue.trim()
      }
      setAvailableOptions(prev => [...prev, newOption])
      handleSelectOption(newOption)
      setInputValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      handleCreateOption()
    }
  }

  const handleRemoveTag = (optionToRemove: Option, e: React.MouseEvent) => {
    e.stopPropagation()
    const newValue = value.filter(v => v.value !== optionToRemove.value)
    onChange(newValue)
  }

  const filteredOptions = availableOptions.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase()) &&
    (!isMulti || !value.some(v => v.value === option.value))
  )

  const showCreateOption = inputValue.trim() && 
    !availableOptions.some(opt => opt.label.toLowerCase() === inputValue.toLowerCase())

  return (
    <div ref={dropdownRef} className="relative">
      <div
        className={`min-h-[42px] px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer flex flex-wrap items-center gap-1 ${
          isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
        } ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
        onClick={() => !isDisabled && setIsOpen(true)}
      >
        {/* Selected Tags */}
        {isMulti && value.map((option) => (
          <span
            key={option.value}
            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
          >
            {option.label}
            {!isDisabled && (
              <button
                type="button"
                onClick={(e) => handleRemoveTag(option, e)}
                className="mr-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            )}
          </span>
        ))}

        {/* Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-0 outline-none bg-transparent"
          disabled={isDisabled}
        />

        {/* Dropdown Arrow */}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && !isDisabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Create new option */}
          {showCreateOption && (
            <div
              onClick={handleCreateOption}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
            >
              <span className="text-blue-600">إنشاء: "{inputValue}"</span>
            </div>
          )}

          {/* Options */}
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelectOption(option)}
              className={`px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                value.some(v => v.value === option.value) ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option.label}</span>
                {value.some(v => v.value === option.value) && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          ))}

          {filteredOptions.length === 0 && !showCreateOption && (
            <div className="px-3 py-2 text-gray-500 text-center">
              لا توجد خيارات
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CreatableSelect