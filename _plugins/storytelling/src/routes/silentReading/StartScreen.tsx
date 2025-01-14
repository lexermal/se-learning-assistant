import { useState } from "react";
import { FaGear } from "react-icons/fa6";
import { Instructions } from './ReadingPromptProvider';
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { getStoryInspiration } from "./RandomStoryTopic";

export function StartScreen(props: { onStart: (i: Instructions) => void }) {
    const [length, setLength] = useState<5 | 8 | 15>(5);
    const [difficulty, setDifficulty] = useState(1);
    const [isOpen, setIsOpen] = useState(false);
    const [topic, setTopic] = useState("");

    return (
        <div className="flex flex-col w-full max-w-md pt-10 sm:py-24 mx-auto stretch">
            <div className="text-4xl text-center mb-8 flex flex-row justify-center items-end group">Storytelling
                <div className="text-xs ml-1 opacity-0 group-hover:opacity-75 cursor-pointer" onClick={() => setIsOpen(!isOpen)}><FaGear /></div>
            </div>
            <div className="w-full h-0">
                <div className="ml-auto h-10 w-7 mt-1">
                    <div className="absolute cursor-pointer" onClick={()=>{
                        setTopic(getStoryInspiration());
                    }}>
                        <GiPerspectiveDiceSixFacesRandom size={"24px"} />
                    </div>
                </div>
            </div>
            <textarea
                className="w-full max-w-md p-3 min-h-32 rounded focus:outline-0 bg-gray-300 dark:bg-gray-800 dark:text-gray-100 border-0"
                placeholder="What should the story be about?"
                value={topic}
                onChange={e => setTopic(e.target.value)} />

            <div className="flex flex-col w-full mt-2">
                <div className={"flex flex-col bg-gray-400 dark:bg-gray-800 p-1 sm:p-4 rounded mt-2 " + (isOpen ? "" : "hidden")}>
                    <StoryLength length={length} setLength={setLength} />
                    <DifficultySlider difficulty={difficulty} setDifficulty={setDifficulty} />
                </div>
            </div>

            <button className="right-0 p-3 mt-4 bg-blue-500 rounded text-xl"
                onClick={() => props.onStart({ topic, length, difficulty })}
            >Start</button>
        </div>
    );
}

function StoryLength(props: { length: 5 | 8 | 15, setLength: (l: 5 | 8 | 15) => void }) {
    return (
        <div className="flex flex-row flex-wrap text-center items-end w-full opacity-80">
            <p className='sm:text-xl sm:w-1/2 text-left py-1'>Story length</p>
            <div className="flex flex-row justify-evenly w-full sm:w-1/2 rounded text-white bg-gray-500 dark:border-gray-600">
                <button className={`py-1 w-full ${props.length === 5 ? 'bg-gray-600' : ''} rounded-l`}
                    onClick={() => props.setLength(5)}
                >Short</button>
                <button className={`py-1 w-full ${props.length === 8 ? 'bg-gray-600' : ''} `}
                    onClick={() => props.setLength(8)}
                >Normal</button>
                <button className={`py-1 w-full ${props.length === 15 ? 'bg-gray-600' : ''} rounded-r`}
                    onClick={() => props.setLength(15)}
                >Long</button>
            </div>
        </div>
    );
}

function DifficultySlider(props: { difficulty: number, setDifficulty: (d: number) => void }) {
    return (
        <div className="flex flex-row flex-wrap items-center mt-4 opacity-80">
            <label className="sm:text-xl sm:w-1/2">Difficulty</label>
            <input
                type="range"
                min="1"
                max="10"
                value={props.difficulty}
                onChange={e => props.setDifficulty(Number(e.target.value))}
                className="w-full sm:w-1/2"
            />
        </div>
    );
}