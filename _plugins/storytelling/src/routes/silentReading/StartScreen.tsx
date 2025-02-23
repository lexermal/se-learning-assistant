import { useEffect, useState } from "react";
import { Instructions } from './ReadingPromptProvider';
import { getStoryInspiration, getRandomStoryPerspective } from "./RandomStoryTopic";
import { usePlugin, UserSettings } from "shared-components";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { getDifficultyLevel } from "shared-components/dist/utils/difficultyConverter";

const storyLength = {
    short: 5,
    medium: 8,
    long: 15
}

type Length = "short" | "medium" | "long";

export function StartScreen(props: { onStart: (i: Instructions) => void }) {
    const [length, setLength] = useState<Length>("short");
    const [difficulty, setDifficulty] = useState(1);
    const [topic, setTopic] = useState("");
    const plugin = usePlugin();

    useEffect(() => {
        plugin.getSettings<UserSettings>({ motherTongue: "English", languageLevel: "A1" }, "user")
            .then(s => setDifficulty(getDifficultyLevel(s.languageLevel)));
    }, []);

    return (
        <div className="flex flex-col w-full max-w-md pt-10 sm:py-24 mx-auto stretch">
            <div className="text-4xl text-center mb-8 flex flex-row justify-center items-end group">Storytelling</div>
            <div className="w-full h-0">
                <div className="ml-auto h-10 w-7 mt-1">
                    {!topic && <div className="absolute cursor-pointer" onClick={() => setTopic(getStoryInspiration())}>
                        <GiPerspectiveDiceSixFacesRandom size={"24px"} />
                    </div>}
                </div>
            </div>
            <textarea
                className="w-full max-w-md p-3 min-h-32 rounded-t focus:outline-0 text-center
                 bg-gray-300 dark:bg-gray-800 dark:text-gray-100 border-0"
                placeholder="What should the story be about?"
                value={topic}
                onChange={e => setTopic(e.target.value)} />

            <div className={"flex flex-col bg-gray-400 dark:bg-gray-800 p-1 rounded-b"}>
                <StoryLength length={length} setLength={setLength} />
            </div>

            <button className="right-0 p-3 mt-4 bg-blue-500 rounded text-xl"
                onClick={() => props.onStart({ topic, length: storyLength[length] as any, difficulty, perspective: getRandomStoryPerspective() })}
            >Start</button>
        </div>
    );
}

function StoryLength(props: { length: Length, setLength: (l: Length) => void }) {
    return (
        <div className="flex flex-row flex-wrap text-center items-end w-full opacity-60 text-gray-200 text-sm">
            <div className="flex flex-row justify-center items-center mx-auto w-full rounded">
                <div className="w-fit mr-3">Story length:</div>
                <LengthButton length={"short"} selectedLength={props.length === "short"} setLength={props.setLength} />
                <LengthButton length={"medium"} selectedLength={props.length === "medium"} setLength={props.setLength} />
                <LengthButton length={"long"} selectedLength={props.length === "long"} setLength={props.setLength} />
            </div>
        </div>
    );
}

function LengthButton(props: { length: Length, selectedLength: boolean, setLength: (length: Length) => void }) {
    return <button className={`py-2 px-2 min-w-20 rounded-md ${props.selectedLength ? 'bg-gray-600 font-bold' : ''}`}
        onClick={() => props.setLength(props.length)}
    >{props.length}</button>;
}