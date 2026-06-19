"use client";

import React, { useState } from 'react';

export default function Page() {
  const [count, setCount] = useState(0);

  const decrementFunction = () => {
    setCount(count - 1);
  };

  const incrementFunction = () => {
    setCount(count + 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <p className="text-2xl font-bold mb-4 text-center">Counter</p>
        <div className="flex items-center gap-4">
          <button
            onClick={decrementFunction}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            -
          </button>
          <p className="text-3xl font-bold">{count}</p>
          <button
            onClick={incrementFunction}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
