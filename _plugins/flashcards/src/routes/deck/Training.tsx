import React, { act } from "react";

export default function Training() {
    const [showAnswer, setShowAnswer] = React.useState(false);
    return (
        <div className="pb-40">
            <div className="flex flex-row border-b-2 border-gray-800">
                <span className="text-3xl mr-2">Deck xxxx</span>
                <div className="flex items-end">
                    <span className="mr-2 font-bold text-blue-500">12</span>+
                    <span className="mx-1 font-bold text-red-500">14</span>+
                    <span className="ml-1 font-bold text-green-600">35</span>
                </div>
            </div>
            <div className="text-center p-5 text-lg">Baum</div>
            {showAnswer && (
                <div className="border-t border-gray-500 text-center pt-5 text-lg">
                    <span>Tree</span>
                </div>)}
            <div className="fixed bottom-0 w-full ebg-white p-4">
                {!showAnswer && renderShowAnswerButton(() => setShowAnswer(true))}
                {showAnswer && renderKnowledgButtons(action => {
                    setShowAnswer(false);
                    // todo send action to backend
                    console.log("Action: ", action);
                }
                )}
            </div>
        </div>
    );
}

function renderShowAnswerButton(onClick: () => void) {
    return <button
        onClick={onClick}
        className="w-full bg-blue-500 text-white p-2 rounded-lg">
        Show answer
    </button>
}

function renderKnowledgButtons(onClick: (action: number) => void) {
    return (
        <div className="flex flex-row justify-evenly gap-2">
            <button onClick={_ => onClick(0)} className="w-1/2 bg-purple-900 text-white p-2 rounded-lg">Again</button>
            <button onClick={_ => onClick(1)} className="w-1/2 bg-red-900 text-white p-2 rounded-lg">Hard</button>
            <button onClick={_ => onClick(2)} className="w-1/2 bg-orange-800 text-white p-2 rounded-lg">Good</button>
            <button onClick={_ => onClick(3)} className="w-1/2 bg-green-800 text-white p-2 rounded-lg">Easy</button>
        </div>
    );
}