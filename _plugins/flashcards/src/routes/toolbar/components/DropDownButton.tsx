import { useState } from "react";
import { Deck } from "../../App";

const AddToDeckButton = ({ options, onSelect }: { options: Deck[], onSelect: (id: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDeck, setSelectedDeck] = useState(options[0].id);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option: string) => {
        setSelectedDeck(option);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block">
            <div className="flex flex-row items-center">
                <button
                    onClick={() => onSelect(selectedDeck)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-l-md shadow border-r border-blue-700 hover:bg-blue-700 focus:outline-none"
                >Add to {
                        options.find(option => option.id === selectedDeck)?.name
                    }</button>
                <button
                    onClick={toggleDropdown}
                    className="px-3 py-2 bg-blue-600 text-white rounded-r-md shadow hover:bg-blue-700 focus:outline-none"
                >
                    O
                </button>
            </div>
            {isOpen && (
                <div className="absolute mt-2 w-48 bg-white border rounded-md shadow-lg">
                    <div className="px-4 py-2 text-gray-700 font-semibold border-b">
                        Add to deck
                    </div>
                    <ul className="py-1">
                        {options.map((option: Deck, index: number) => (
                            <li
                                key={index}
                                onClick={() => handleOptionClick(option.id)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"                            >
                                {option.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AddToDeckButton;
