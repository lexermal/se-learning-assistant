import React, { useState, useEffect } from 'react';

interface TagInputProps {
    initialTags: string[];
    onTagsChange: (tags: string[]) => void;
    className?: string;
}

const TagInput: React.FC<TagInputProps> = ({ initialTags, onTagsChange, className }) => {
    const [tags, setTags] = useState(initialTags);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        onTagsChange(tags);
    }, [tags]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ' ' || e.key === 'Tab' || e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim() !== '') {
                setTags([...tags, inputValue.trim()]);
                setInputValue('');
            }
        }
    };

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    return (
        <div className={"flex flex-wrap items-center p-1 pb-0 mt-1 rounded bg-gray-900 opacity-65 text-gray-300 " + (className || "")}>
            {tags.map((tag, index) => (
                <button key={index}
                    className="bg-gray-800 p-1 px-2 rounded mr-1 mb-1 text-sm border-0"
                    onClick={() => removeTag(index)}>{tag}</button>
            ))}
            <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add tags"
                className="flex-grow p-1 pl-2 border-0 rounded bg-gray-800 mb-1 outline-none text-sm"
            />
        </div>
    );
};

export default TagInput;