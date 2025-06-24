import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceDot } from 'recharts';
import confetti from 'canvas-confetti';

const generateInitialData = () => Array.from({ length: 1 }, (_, i) => ({ month: `Week ${i + 1}`, price: 35 + Math.random() * 20 }));

const generateNextPrice = (lastPrice) => {
  let next = lastPrice + (Math.random() - 0.5) * 30; // more volatile like BTC
  return Math.max(10, Math.min(60, parseFloat(next.toFixed(2))));
};

export default function CatchTheDipGame() {
  const [marketData, setMarketData] = useState(generateInitialData());
  const [buyIndex, setBuyIndex] = useState(null);
  const [dipIndex, setDipIndex] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(1);
  const intervalRef = useRef(null);
  const hasFiredConfetti = useRef(false);

  useEffect(() => {
    startGame();
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (gameOver && buyIndex === dipIndex && !hasFiredConfetti.current) {
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      hasFiredConfetti.current = true;
    }
  }, [gameOver, buyIndex, dipIndex]);

  const startGame = () => {
    clearInterval(intervalRef.current);
    hasFiredConfetti.current = false;
    intervalRef.current = setInterval(() => {
      setMarketData((prev) => {
        if (prev.length >= 26) {
          clearInterval(intervalRef.current);
          const minIndex = prev.reduce((minIdx, val, idx, arr) => val.price < arr[minIdx].price ? idx : minIdx, 0);
          setDipIndex(minIndex);
          setGameOver(true);
          return prev;
        }
        const lastPrice = prev[prev.length - 1].price;
        const nextPrice = generateNextPrice(lastPrice);
        return [...prev, { month: `Week ${prev.length + 1}`, price: nextPrice }];
      });
      setCurrentIndex((idx) => idx + 1);
    }, 400);
  };

  const handleBuy = () => {
    if (!gameOver) {
      setBuyIndex(marketData.length - 1);
    }
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setMarketData(generateInitialData());
    setBuyIndex(null);
    setDipIndex(null);
    setGameOver(false);
    setCurrentIndex(1);
    hasFiredConfetti.current = false;
    startGame();
  };

  const prices = marketData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = 10;

  return (
    <div className="p-4 max-w-2xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Catch the Market Dip Game</h1>
      <LineChart width={700} height={400} data={marketData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
        <XAxis dataKey="month" interval={2} angle={-45} textAnchor="end" height={60} />
        <YAxis domain={[minPrice - padding, maxPrice + padding]} />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Tooltip />
        <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} isAnimationActive={true} />
        {buyIndex !== null && (
          <ReferenceDot x={marketData[buyIndex].month} y={marketData[buyIndex].price} r={6} fill="green" stroke="none" label="Your Buy" />
        )}
        {gameOver && dipIndex !== null && (
          <ReferenceDot x={marketData[dipIndex].month} y={marketData[dipIndex].price} r={6} fill="red" stroke="none" label="Dip" />
        )}
      </LineChart>
      <div className="mt-6 flex justify-center gap-4">
        {!gameOver && buyIndex === null && (
          <button onClick={handleBuy} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Buy Now!</button>
        )}
        {gameOver && (
          <button onClick={handleReset} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded border">Play Again</button>
        )}
      </div>
      {gameOver && buyIndex !== null && dipIndex !== null && (
        <div className="mt-4 text-lg">
          <p>Your buy price: <strong>${marketData[buyIndex].price}</strong></p>
          <p>Lowest dip price: <strong>${marketData[dipIndex].price}</strong></p>
          <p>{buyIndex === dipIndex ? "🎉 Congrats! You caught the dip! 🎉" : "Oops! Try again next time."}</p>
        </div>
      )}
    </div>
  );
}
