import { useState } from 'react';
import axios from 'axios';

function NumberFetcher() {
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNumbers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:3000/numbers');
      setNumbers(response.data.numbers || []);
    } catch {
      setError('Failed to fetch numbers');
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Number Management Service</h1>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={fetchNumbers}
      >
        Fetch Numbers
      </button>

      {loading && <p className="mt-4">Loading...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {numbers.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Sorted Unique Numbers:</h2>
          <p>{numbers.join(', ')}</p>
        </div>
      )}
    </div>
  );
}

export default NumberFetcher;
