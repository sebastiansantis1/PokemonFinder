import React, { useState, useEffect } from "react";
import "./PokemonFetcher.css";

// Objeto con colores para cada tipo de Pokémon
const typeColors = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  grass: '#78C850',
  electric: '#F8D030',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC'
};

// Función para convertir hex a rgba
const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

const tipos = [
  "normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison",
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"
];

function PokemonFetcher() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [pokemonList, setPokemonList] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState({
    borderColor: '#ffde00',
    backgroundColor: 'rgba(255, 255, 255, 0.15)'
  });

  // Actualizar el tema cuando cambia el tipo seleccionado
  useEffect(() => {
    if (tipoSeleccionado) {
      const color = typeColors[tipoSeleccionado] || '#ffde00';
      setCurrentTheme({
        borderColor: color,
        backgroundColor: `rgba(${hexToRgb(color)}, 0.15)`
      });
    } else {
      setCurrentTheme({
        borderColor: '#ffde00',
        backgroundColor: 'rgba(255, 255, 255, 0.15)'
      });
    }
  }, [tipoSeleccionado]);

  const fetchPokemonsByType = async (type) => {
    setLoading(true);
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
      if (!response.ok) throw new Error("Error al cargar los Pokémon");
      
      const data = await response.json();
      const pokemons = data.pokemon.slice(0, 20);

      const pokemonsWithImages = await Promise.all(
        pokemons.map(async (entry) => {
          const res = await fetch(entry.pokemon.url);
          if (!res.ok) throw new Error("Error al cargar los detalles del Pokémon");
          
          const pokeData = await res.json();
          return {
            name: entry.pokemon.name,
            image: pokeData.sprites.other["official-artwork"]?.front_default || 
                  pokeData.sprites.front_default,
            types: pokeData.types.map(t => t.type.name)
          };
        })
      );

      setPokemonList(pokemonsWithImages);
      setError("");
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los Pokémon. Inténtalo de nuevo más tarde.");
      setPokemonList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTipoChange = (e) => {
    const selected = e.target.value;
    setTipoSeleccionado(selected);
    if (selected) fetchPokemonsByType(selected);
  };

  return (
    <div 
      className="pokemon-container"
      style={{
        borderColor: currentTheme.borderColor,
        background: currentTheme.backgroundColor
      }}
    >
      <h2>Busca Pokémon por tipo</h2>
      
      <div className="type-selector-container">
        <label className="type-selector-label">Elige un tipo:</label>
        <div className="custom-select">
          <select 
            value={tipoSeleccionado} 
            onChange={handleTipoChange}
            style={{ borderColor: currentTheme.borderColor }}
          >
            <option value="">Selecciona un tipo</option>
            {tipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </option>
            ))}
          </select>
          <span className="custom-arrow"></span>
        </div>
      </div>

      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          Cargando Pokémon...
        </div>
      )}
      
      {error && <div className="pokemon-container error">{error}</div>}

      <div className="pokemon-list">
        {pokemonList.map((pokemon, index) => {
          // Obtener el color principal del primer tipo del Pokémon
          const primaryType = pokemon.types[0];
          const cardColor = typeColors[primaryType] || '#e63947';
          
          return (
            <div 
              className="pokemon-card" 
              key={index}
              style={{
                background: `linear-gradient(135deg, ${cardColor} 0%, ${darkenColor(cardColor, 20)} 100%)`,
                borderColor: lightenColor(cardColor, 30)
              }}
            >
              <h3>{pokemon.name}</h3>
              {pokemon.image && (
                <img 
                  src={pokemon.image} 
                  alt={pokemon.name}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/140?text=Pokemon";
                  }}
                />
              )}
              <div className="pokemon-types">
                {pokemon.types.map((type, i) => (
                  <span 
                    key={i}
                    className="type-badge"
                    style={{ backgroundColor: typeColors[type] || '#A8A878' }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Funciones auxiliares para manipular colores
function lightenColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
}

function darkenColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return `#${(
    0x1000000 +
    (R > 0 ? (R < 255 ? R : 255) : 0) * 0x10000 +
    (G > 0 ? (G < 255 ? G : 255) : 0) * 0x100 +
    (B > 0 ? (B < 255 ? B : 255) : 0)
  )
    .toString(16)
    .slice(1)}`;
}

export default PokemonFetcher;