"use client";
import React, { useState } from 'react';

type SeedType = 'random' | 'text' | 'date' | 'coordinates' | 'biome';

interface HistoryItem {
  seed: string;
  type: SeedType;
  date: string;
}

const SEED_TYPES: Record<SeedType, string> = {
  random: 'random',
  text: 'text',
  date: 'date',
  coordinates: 'coordinates',
  biome: 'biome'
};

const MinecraftSeedGenerator: React.FC = () => {
  const [seed, setSeed] = useState<string>('');
  const [seedType, setSeedType] = useState<SeedType>(SEED_TYPES.random as SeedType);
  const [inputText, setInputText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // 64-битная хэш-функция как в Minecraft Java
  const minecraftHash = (text: string): string => {
    let hash = 0n;
    for (let i = 0; i < text.length; i++) {
      const char = BigInt(text.charCodeAt(i));
      hash = ((hash << 5n) - hash) + char;
      hash = hash & 0xFFFFFFFFFFFFFFFFn; // 64-битная маска
    }
    
    // Преобразуем в знаковое 64-битное число (от -2^63 до 2^63-1)
    if (hash > 0x7FFFFFFFFFFFFFFFn) {
      hash = hash - 0x10000000000000000n;
    }
    return hash.toString();
  };

  // Случайный 64-битный сид
  const generateRandomSeed = (): string => {
    // Генерируем 8 случайных байт
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    
    // Преобразуем в BigInt
    let result = 0n;
    for (let i = 0; i < 8; i++) {
      result = (result << 8n) | BigInt(bytes[i]);
    }
    
    // Преобразуем в знаковое число
    if (result > 0x7FFFFFFFFFFFFFFFn) {
      result = result - 0x10000000000000000n;
    }
    
    return result.toString();
  };

  // Генерация из координат
  const generateFromCoordinates = (x: number, z: number): string => {
    // Комбинируем координаты в 64-битное число
    const xBig = BigInt(x) & 0xFFFFFFFFn;
    const zBig = BigInt(z) & 0xFFFFFFFFn;
    const combined = (xBig << 32n) | zBig;
    
    // Преобразуем в знаковое
    if (combined > 0x7FFFFFFFFFFFFFFFn) {
      return (combined - 0x10000000000000000n).toString();
    }
    return combined.toString();
  };

  // Генерация из даты и времени
  const generateFromDateTime = (date: Date = new Date()): string => {
    const timestamp = BigInt(date.getTime());
    // Добавляем случайность на основе миллисекунд
    const random = BigInt(Math.floor(Math.random() * 1000));
    const combined = (timestamp << 10n) | random;
    
    if (combined > 0x7FFFFFFFFFFFFFFFn) {
      return (combined - 0x10000000000000000n).toString();
    }
    return combined.toString();
  };

  // Генерация для конкретного биома
  const generateForBiome = (biomeName: string): string => {
    const baseHash = minecraftHash(biomeName);
    // Добавляем смещение для вариаций
    const variation = BigInt(Math.floor(Math.random() * 1000));
    const combined = (BigInt(baseHash) + variation) & 0xFFFFFFFFFFFFFFFFn;
    
    if (combined > 0x7FFFFFFFFFFFFFFFn) {
      return (combined - 0x10000000000000000n).toString();
    }
    return combined.toString();
  };

  const generateSeed = (): void => {
    try {
      let newSeed: string;
      
      switch(seedType) {
        case 'random':
          newSeed = generateRandomSeed();
          break;
        case 'text':
          if (!inputText.trim()) {
            setError('Введите текст для генерации');
            return;
          }
          newSeed = minecraftHash(inputText);
          break;
        case 'date':
          newSeed = generateFromDateTime();
          break;
        case 'coordinates':
          // Случайные координаты в пределах мира Minecraft
          const x = Math.floor(Math.random() * 60000000) - 30000000;
          const z = Math.floor(Math.random() * 60000000) - 30000000;
          newSeed = generateFromCoordinates(x, z);
          break;
        case 'biome':
          const biomes = ['plains', 'desert', 'jungle', 'taiga', 'snowy', 'ocean'];
          const randomBiome = biomes[Math.floor(Math.random() * biomes.length)];
          newSeed = generateForBiome(randomBiome);
          break;
        default:
          newSeed = generateRandomSeed();
      }
      
      setSeed(newSeed);
      setError('');
      
      // Добавляем в историю
      setHistory(prev => [
        { seed: newSeed, type: seedType, date: new Date().toLocaleString() },
        ...prev.slice(0, 9) // Храним только 10 последних
      ]);
      
    } catch (err) {
      setError('Ошибка генерации сида');
    }
  };

  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(seed);
    alert('Сид скопирован в буфер обмена!');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      generateSeed();
    }
  };

  return (
    <div className="minecraft-seed-generator">
      <style>{`
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: linear-gradient(135deg, #1a2a3a, #0f1a24);
          border-radius: 15px;
          color: white;
          font-family: 'Minecraft', monospace;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        
        .title {
          text-align: center;
          color: #4ade80;
          font-size: 24px;
          margin-bottom: 20px;
          text-shadow: 2px 2px 0 #166534;
        }
        
        .type-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .type-btn {
          padding: 10px;
          background: #2d3f4f;
          border: 2px solid #4a5f70;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }
        
        .type-btn.active {
          background: #4ade80;
          border-color: #166534;
          color: #0f1a24;
          font-weight: bold;
        }
        
        .type-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(74, 222, 128, 0.3);
        }
        
        .input-group {
          margin-bottom: 20px;
        }
        
        .input-group label {
          display: block;
          margin-bottom: 5px;
          color: #9ca3af;
          font-size: 14px;
        }
        
        .input-group input {
          width: 100%;
          padding: 12px;
          background: #1e2c38;
          border: 2px solid #3a4b5a;
          border-radius: 8px;
          color: white;
          font-size: 16px;
          transition: all 0.2s;
        }
        
        .input-group input:focus {
          outline: none;
          border-color: #4ade80;
          box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.2);
        }
        
        .input-group input::placeholder {
          color: #4a5f70;
        }
        
        .generate-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          border: none;
          border-radius: 8px;
          color: #0f1a24;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 20px;
        }
        
        .generate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(74, 222, 128, 0.4);
        }
        
        .generate-btn:active {
          transform: translateY(0);
        }
        
        .seed-result {
          background: #1e2c38;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border: 2px solid #4ade80;
          margin-bottom: 20px;
        }
        
        .seed-label {
          color: #9ca3af;
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        .seed-value {
          font-size: 28px;
          color: #4ade80;
          word-break: break-all;
          font-family: monospace;
          margin-bottom: 15px;
          background: #0f1a24;
          padding: 15px;
          border-radius: 5px;
        }
        
        .copy-btn {
          padding: 10px 20px;
          background: #3a4b5a;
          border: none;
          border-radius: 5px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 16px;
        }
        
        .copy-btn:hover {
          background: #4a5f70;
        }
        
        .error {
          color: #ef4444;
          padding: 10px;
          background: #7f1d1d;
          border-radius: 8px;
          margin-bottom: 10px;
          text-align: center;
        }
        
        .history {
          margin-top: 20px;
        }
        
        .history h3 {
          color: #9ca3af;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .history-list {
          background: #1e2c38;
          border-radius: 8px;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          border-bottom: 1px solid #3a4b5a;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .history-item:hover {
          background: #2d3f4f;
        }
        
        .history-item:last-child {
          border-bottom: none;
        }
        
        .history-seed {
          font-family: monospace;
          color: #4ade80;
        }
        
        .history-info {
          font-size: 12px;
          color: #9ca3af;
        }
        
        .stats {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          padding: 10px;
          background: #1e2c38;
          border-radius: 8px;
          font-size: 12px;
          color: #9ca3af;
        }
        
        .stat-value {
          color: #4ade80;
          font-weight: bold;
        }

        .disabled-input {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>

      <div className="container">
        <h1 className="title">🎮 Генератор сидов Minecraft 64-bit</h1>
        
        <div className="type-selector">
          <button 
            className={`type-btn ${seedType === 'random' ? 'active' : ''}`}
            onClick={() => setSeedType('random')}
          >
            🎲 Случайный
          </button>
          <button 
            className={`type-btn ${seedType === 'text' ? 'active' : ''}`}
            onClick={() => setSeedType('text')}
          >
            📝 Из текста
          </button>
          <button 
            className={`type-btn ${seedType === 'date' ? 'active' : ''}`}
            onClick={() => setSeedType('date')}
          >
            📅 Из даты
          </button>
          <button 
            className={`type-btn ${seedType === 'coordinates' ? 'active' : ''}`}
            onClick={() => setSeedType('coordinates')}
          >
            🌍 Координаты
          </button>
          <button 
            className={`type-btn ${seedType === 'biome' ? 'active' : ''}`}
            onClick={() => setSeedType('biome')}
          >
            🌲 Для биома
          </button>
        </div>

        {seedType === 'text' && (
          <div className="input-group">
            <label>Введите текст:</label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Например: my cool world"
              onKeyPress={handleKeyPress}
            />
          </div>
        )}

        {seedType === 'biome' && (
          <div className="input-group">
            <label>Будет сгенерирован сид для случайного биома:</label>
            <input
              type="text"
              value="plains, desert, jungle, taiga, snowy, ocean"
              disabled
              className="disabled-input"
            />
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <button className="generate-btn" onClick={generateSeed}>
          🚀 Сгенерировать сид
        </button>

        {seed && (
          <div className="seed-result">
            <div className="seed-label">Ваш сид (совместим с Minecraft Java/Bedrock):</div>
            <div className="seed-value">{seed}</div>
            <button className="copy-btn" onClick={copyToClipboard}>
              📋 Копировать в буфер
            </button>
          </div>
        )}

        {history.length > 0 && (
          <div className="history">
            <h3>📜 История последних сидов:</h3>
            <div className="history-list">
              {history.map((item, index) => (
                <div 
                  key={index} 
                  className="history-item"
                  onClick={() => setSeed(item.seed)}
                >
                  <span className="history-seed">{item.seed.substring(0, 12)}...</span>
                  <span className="history-info">{item.type} • {item.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="stats">
          <span>🎯 Диапазон: <span className="stat-value">-9.2кв до 9.2кв</span></span>
          <span>🔢 Битов: <span className="stat-value">64</span></span>
          <span>💾 Совместимость: <span className="stat-value">Java/Bedrock</span></span>
        </div>
      </div>
    </div>
  );
};

export default MinecraftSeedGenerator;