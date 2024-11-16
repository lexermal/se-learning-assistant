import Postmate from 'postmate';
import React, { useEffect } from 'react';

let currentHeight = 0;

function App() {
  const [cards, setCards] = React.useState([] as string[]);

  useEffect(() => {
    const plugin = new Postmate.Model({
      // Expose the height property to the parent window
      // exampleProp: "hello world from me",
      setCards: (data: string[]) => {
        console.log("setting cards ", data);
        setCards(data);
      },
      getCards: () => {
        return "cards";
      }
    });

    plugin.then((parent) => {
      // Emit a message to the parent window
      console.log("sending message to parent");
      parent.emit('getCards');
    });

    //resizing
    const handleResize = () => {
      const height = document.body.scrollHeight;
      if (height === currentHeight) return;

      plugin.then(child => child.emit('heightAdjustment', height));

      currentHeight = height;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  return (
    <h1 className="text-3xl font-bold underline text-red-600 text-center">
      Simple React Typescript Tailwind Sample
      Simple React Typescript Tailwind Sample
      Simple React Typescript Tailwind Sample
      {
        cards.map((card, index) => (
          <div key={index}>{card}</div>
        ))
      }
    </h1>
  );
}

export default App;