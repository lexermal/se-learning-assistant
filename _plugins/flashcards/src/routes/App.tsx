import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import { usePlugin } from '../utils/PluginProvider';
import { CRUDModal } from '../components/CRUDModal';

interface Deck {
  id: string;
  name: string;
}

function App() {
  const [decks, setDecks] = React.useState([] as Deck[]);
  const { dbFetch, dbUpdate, dbInsert } = usePlugin();

  useEffect(() => {
    dbFetch("deck", "id, name").then(setDecks);
  }, []);

  return (
    <div className="mx-auto bg-gray-400 w-96 p-4 rounded-lg">
      <h1 className='text-4xl mb-3 text-center'>Decks</h1>
      {
        decks.map((deck, index) => (
          <DeckRow key={index} deck={deck} onEdit={(id, name) => {
            dbUpdate("deck", { id }, { name });
            setDecks(decks.map(d => d.id === id ? { ...d, name } : d));
          }} />
        ))
      }
      <DeckCrudModal className='mt-6 block' buttonText='Add deck' onComplete={name => {
        dbInsert("deck", { name }, "id, name").then(newDeck => setDecks([...decks, newDeck[0]]));
      }} />

      <Link className='mt-6 block' to={`/test`}>Test page</Link>
    </div>
  );
}

// todo show numbers of cards with their status new, learning, review (dummy data)

function DeckRow(props: { deck: Deck, onEdit: (id: string, name: string) => void }) {
  return (
    <div className='group flex flex-row hover:bg-gray-500 hover:font-bold justify-between text-left'>
      <Link to={`/deck/${props.deck.id}`} className='flex-1'>
        <span className='cursor-pointer'>{props.deck.name}</span>
      </Link>
      <div className='flex-2 flex-row'>
        <span className='mr-2'>10</span>
        <span className='mr-2'>5</span>
        <span className='mr-2'>3</span>
      </div>
      <div className='flex-3 flex-row opacity-0 group-hover:opacity-100'>
        <DeckCrudModal buttonText='Edit' deckName={props.deck.name} onComplete={newName => {
          props.onEdit(props.deck.id, newName);
        }} />
        <button className='ml-2'>Delete</button>
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