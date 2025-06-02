import { useState } from 'react';
import axios from 'axios';

function App() {
  const [numbers, setNumbers] = useState([]);
  const [error, setError] = useState(null);

  const fetchNumbers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/numbers");
      setNumbers(res.data.numbers);
      setError(null);
    } catch (err) {
      setError("Failed to fetch numbers");
      setNumbers([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Number Aggregator</h1>
      <button
        onClick={fetchNumbers}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4"
      >
        Fetch Numbers
      </button>
      {error && <p className="text-red-600">{error}</p>}
      <div className="bg-white p-4 rounded shadow w-full max-w-md">
        <h2 className="font-semibold text-xl mb-2">Result</h2>
        <pre className="whitespace-pre-wrap break-all">{JSON.stringify(numbers)}</pre>
      </div>
    </div>
  );
}

export default App;
