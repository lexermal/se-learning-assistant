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
          <div className='cursor-pointer hover:font-bold' key={index}>{deck.name}</div>
        ))
      }
      <button className='mt-6 block' onClick={() => emit('addDeck', 'New deck')}>Add deck</button>
      <Link className='mt-6 block' to={`/test`}>Test page</Link>
    </div>
  );
}

export default App;