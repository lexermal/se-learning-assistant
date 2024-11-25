import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import { usePlugin } from '../utils/PluginProvider';
import { CRUDModal } from '../components/CRUDModal';

export interface Deck {
  id: string;
  name: string;
}

type DeckSummary = Deck & {
  total_new: number;
  total_learning: number;
  total_review: number;
}

function App() {
  const [decks, setDecks] = React.useState([] as DeckSummary[]);
  const { dbUpdate, dbInsert, dbDelete, dbFunctionCall } = usePlugin();

  useEffect(() => {
    dbFunctionCall("due_today_summary").then(setDecks);
  }, []);

  return (
    <div className="mx-auto bg-gray-400 w-96 p-4 rounded-lg">
      <h1 className='text-4xl mb-3 text-center'>Decks</h1>
      {
        decks.map((deck, index) => (
          <DeckRow key={index} deck={deck} onEdit={(id, name) => {
            dbUpdate("deck", { id }, { name });
            setDecks(decks.map(d => d.id === id ? { ...d, name } : d));
          }} onDelete={id => {
            dbDelete("deck", { id });
            setDecks(decks.filter(d => d.id !== id));
          }} />
        ))
      }
      <DeckCrudModal className='mt-6 block' buttonText='Add deck' onComplete={name => {
        dbInsert("deck", { name }, "id, name").then(newDeck => setDecks([...decks, newDeck[0]]));
      }} />
    </div>
  );
}

function DeckRow(props: { deck: DeckSummary, onEdit: (id: string, name: string) => void, onDelete: (id: string) => void }) {
  return (
    <div className='group flex flex-row hover:bg-gray-500 hover:font-bold justify-between text-left'>
      <Link to={`/deck/${props.deck.id}`} className='flex-1'>
        <span className='cursor-pointer'>{props.deck.name}</span>
      </Link>
      <div className='flex-2 flex-row'>
        <span className='mr-2 text-blue-600'>{props.deck.total_new}</span>
        <span className='mr-2 text-red-700'>{props.deck.total_learning}</span>
        <span className='mr-2 text-green-600'>{props.deck.total_review}</span>
      </div>
      <div className='flex-3 flex-row opacity-0 group-hover:opacity-100'>
        <DeckCrudModal buttonText='Edit' deckName={props.deck.name} onComplete={newName => {
          props.onEdit(props.deck.id, newName);
        }} />
        <button className='ml-2' onClick={() => props.onDelete(props.deck.id)}>Delete</button>
      </div>
    </div>
  );
}

function DeckCrudModal(props: { onComplete: (deck: string) => void, deckName?: string, buttonText: string, className?: string }) {
  const [deck, setDeck] = React.useState(props.deckName || "");

  useEffect(() => {
    setDeck(props.deckName || "");
  }, [props.deckName]);

  return <CRUDModal
    className={props.className}
    buttonText={props.buttonText}
    title={props.deckName ? "Edit deck" : "Add deck"}
    actionbuttons={[
      {
        text: "Save", onClick: () => {
          props.onComplete(deck);
          setDeck("");
        }
      },
      { text: "Cancel", onClick: () => setDeck("") },
    ]}>
    <div className="flex flex-col gap-4">
      <input placeholder="Deck name" defaultValue={deck} onChange={e => setDeck(e.target.value)} />
    </div>
  </CRUDModal>
}


export default App;