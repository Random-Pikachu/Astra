import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

function Pokemon() {
  const [pokemonInfo, setPokemonInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getPokemonInfo();
        setPokemonInfo(data);
      } catch (error) {
        console.error('Failed to fetch Pokemon info');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-white mb-8 drop-shadow-2xl">
          I like Pokemons
        </h1>
        <p className="text-2xl text-pink-200 mb-8 max-w-2xl mx-auto leading-relaxed">
          {isLoading ? 'Loading...' : (pokemonInfo?.message || 'Gotta catch \'em all! Pokemon are amazing creatures with unique abilities and personalities.')}
        </p>
        {pokemonInfo && (
          <div className="mb-8 p-4 bg-black bg-opacity-30 rounded-lg">
            <p className="text-lg text-pink-300 mb-2">My Favorite Pokemon:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {pokemonInfo.favorites?.map((pokemon: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-pink-600 rounded-full text-sm">
                  {pokemon}
                </span>
              ))}
            </div>
            <p className="text-sm text-pink-400 mt-2">Total: {pokemonInfo.count} favorites</p>
          </div>
        )}
        <div className="text-6xl mb-8">🔥⚡🌊🌿</div>
        <div className="flex gap-6 justify-center">
          <Link
            to="/"
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Back to Home
          </Link>
          <Link
            to="/about"
            className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-pink-900 transition-all duration-200"
          >
            About Kiro
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Pokemon;