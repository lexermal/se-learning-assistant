import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import { usePlugin } from '../utils/PluginProvider';

interface Deck {
  id: number;
  name: string;
}

function App() {
  const [decks, setDecks] = React.useState([] as Deck[]);
  const { emit, on, dbFetch } = usePlugin();

  useEffect(() => {
    dbFetch("deck", "id, name").then(setDecks);
  }, []);

  return (
    <div className="mx-auto bg-gray-400 w-72 p-4 rounded-lg">
      <h1 className='text-4xl mb-3 text-center'>Decks</h1>
      {
        decks.map((deck, index) => (
          <DeckRow key={index} deck={deck} />
        ))
      }
      <button className='mt-6 block' onClick={() => emit('addDeck', 'New deck')}>Add deck</button>
      <Link className='mt-6 block' to={`/test`}>Test page</Link>
    </div>
  );
}

// show numbers of cards with their status new, learning, review (dummy data)

function DeckRow(props: { deck: Deck }) {
  return (
    <div className='group flex flex-row hover:bg-gray-500 hover:font-bold cursor-pointer justify-between text-left'>
      <Link to={`/deck/${props.deck.id}`} className='flex flex-row'>
        <span className='cursor-pointer'>{props.deck.name}</span>
      </Link>
      <div className='flex flex-row'>
        <span className='mr-2'>10</span>
        <span className='mr-2'>5</span>
        <span className='mr-2'>3</span>
      </div>
      <div className='flex flex-row opacity-0 group-hover:opacity-100'>
        <button className='mr-2'>Edit</button>
        <button className='mr-2'>Delete</button>
      </div>
    </div>
  );
}

export default App;