import { useState } from "react";
import { Deck } from "../routes/DeckOverviewPage";
import { FaGear } from "react-icons/fa6";

interface Props {
    options: Deck[];
    onSelect: (deckId: string) => void;
    className?: string;
}

const AddToDeckButton = ({ options, onSelect, className }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDeck, setSelectedDeck] = useState(options[0]?.id);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option: string) => {
        setSelectedDeck(option);
        setIsOpen(false);
    };

    if (options.length === 0) {
        return null;
    }

    return (
        <div className={"relative inline-block " + (className || "")}>
            <div className="flex flex-row items-center">
                <button
                    onClick={() => onSelect(selectedDeck)}
                    className="h-12 px-4 py-2 bg-blue-500 text-white rounded-l-md shadow border-r focus:outline-none border-blue-800">
                    Add to {options.find(option => option.id === selectedDeck)?.name}
                </button>
                <button
                    onClick={toggleDropdown}
                    className="px-3 py-2 bg-blue-500 text-white rounded-r-md shadow focus:outline-none h-12">
                    <FaGear />
                </button>
            </div>
            {isOpen && (
                <div className="absolute mt-2 w-48 bg-gray-500 dark:bg-gray-800 border rounded-md shadow-lg z-50 border-gray-700">
                    <div className="px-4 py-2 text-gray-100 font-semibold border-b border-gray-700">
                        Add to deck...
                    </div>
                    <ul className="py-1">
                        {options.map((option: Deck, index: number) => (
                            <li
                                key={index}
                                onClick={() => handleOptionClick(option.id)}
                                className="px-4 py-2 text-gray-100 hover:bg-gray-600 dark:hover:bg-gray-100 cursor-pointer">
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
