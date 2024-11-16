import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import { usePlugin } from '../utils/PluginProvider';

function App() {
  const [cards, setCards] = React.useState([] as string[]);
  const { emit, on } = usePlugin();

  useEffect(() => {
    on('setCards', (data: string[]) => {
      console.log("setting cards ", data);
      setCards(data);
    }
    );
    // Emit a message to the parent window
    console.log("sending message to parent");
    emit('getCards');
  }, []);

  return (
    <div className="text-3xl font-bold underline text-center">
      Simple React Typescript Tailwind Sample
      Simple React Typescript Tailwind Sample
      Simple React Typescript Tailwind Sample
      {
        cards.map((card, index) => (
          <div key={index}>{card}</div>
        ))
      }
      <Link to={`/test`}>Test page</Link>
    </div>
  );
}

export default App;