import { Link } from "react-router-dom";

export default function TestApp() {
  return (
    <>
      <h1 className="text-6xl">React Router test page</h1>
      <Link to={`/`}>Back to main page</Link>
    </>
  );
}
