"use client";
import React, { useState } from 'react';
import styles from './seeds.module.css';

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
      hash = hash & 0xFFFFFFFFFFFFFFFFn;
    }
    
    if (hash > 0x7FFFFFFFFFFFFFFFn) {
      hash = hash - 0x10000000000000000n;
    }
    return hash.toString();
  };

  const generateRandomSeed = (): string => {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    
    let result = 0n;
    for (let i = 0; i < 8; i++) {
      result = (result << 8n) | BigInt(bytes[i]);
    }
    
    if (result > 0x7FFFFFFFFFFFFFFFn) {
      result = result - 0x10000000000000000n;
    }
    
    return result.toString();
  };

  const generateFromCoordinates = (x: number, z: number): string => {
    const xBig = BigInt(x) & 0xFFFFFFFFn;
    const zBig = BigInt(z) & 0xFFFFFFFFn;
    const combined = (xBig << 32n) | zBig;
    
    if (combined > 0x7FFFFFFFFFFFFFFFn) {
      return (combined - 0x10000000000000000n).toString();
    }
    return combined.toString();
  };

  const generateFromDateTime = (date: Date = new Date()): string => {
    const timestamp = BigInt(date.getTime());
    const random = BigInt(Math.floor(Math.random() * 1000));
    const combined = (timestamp << 10n) | random;
    
    if (combined > 0x7FFFFFFFFFFFFFFFn) {
      return (combined - 0x10000000000000000n).toString();
    }
    return combined.toString();
  };

  const generateForBiome = (biomeName: string): string => {
    const baseHash = minecraftHash(biomeName);
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
      
      setHistory(prev => [
        { seed: newSeed, type: seedType, date: new Date().toLocaleString() },
        ...prev.slice(0, 9)
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
        .generator-container {
          max-width: 650px;
          margin: 0 auto 40px;
          padding: 30px;
          background-color: #fff700;
          border: 2px solid #ffcc00;
          font-family: Arial, sans-serif;
        }
        
        .generator-title {
          text-align: center;
          color: #222;
          font-size: 24px;
          margin: 0 0 25px 0;
          font-weight: bold;
          text-transform: uppercase;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        
        .generator-type-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 10px;
          margin-bottom: 25px;
        }
        
        .generator-type-btn {
          padding: 12px 8px;
          background-color: #eaeaea;
          border: 2px solid #333;
          color: #333;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        
        .generator-type-btn:hover {
          background-color: #d0d0d0;
          border-color: #000;
        }
        
        .generator-type-btn.active {
          background-color: #0066cc;
          border-color: #004080;
          color: white;
        }
        
        .generator-input-group {
          background-color: #fff;
          padding: 20px;
          border: 2px solid #333;
          margin-bottom: 25px;
        }
        
        .generator-input-group label {
          display: block;
          margin-bottom: 10px;
          color: #222;
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .generator-input-group input {
          width: 100%;
          padding: 12px;
          background: white;
          border: 2px solid #333;
          color: #333;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .generator-input-group input:focus {
          outline: none;
          border-color: #0066cc;
          background: #f0f8ff;
        }
        
        .generator-input-group input::placeholder {
          color: #999;
        }
        
        .generator-generate-btn {
          width: 100%;
          padding: 15px;
          background-color: #0066cc;
          border: 2px solid #004080;
          color: white;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 30px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .generator-generate-btn:hover {
          background-color: #004080;
        }
        
        .generator-seed-result {
          background-color: #fff;
          padding: 25px;
          border: 2px solid #333;
          text-align: center;
          margin-bottom: 30px;
        }
        
        .generator-seed-label {
          color: #222;
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .generator-seed-value {
          font-size: 32px;
          color: #0066cc;
          word-break: break-all;
          font-family: 'Courier New', monospace;
          margin-bottom: 20px;
          background: #f5f5f5;
          padding: 15px;
          border: 2px solid #333;
        }
        
        .generator-copy-btn {
          padding: 12px 30px;
          background-color: #eaeaea;
          border: 2px solid #333;
          color: #333;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        
        .generator-copy-btn:hover {
          background-color: #d0d0d0;
          border-color: #000;
        }
        
        .generator-error {
          color: #c62828;
          padding: 15px;
          background: #ffebee;
          border: 2px solid #c62828;
          margin-bottom: 20px;
          text-align: center;
          font-size: 16px;
          font-weight: bold;
        }
        
        .generator-history {
          margin-top: 30px;
          background-color: #fff;
          padding: 20px;
          border: 2px solid #333;
        }
        
        .generator-history h3 {
          color: #222;
          margin: 0 0 15px 0;
          font-size: 18px;
          text-align: center;
          text-transform: uppercase;
          font-weight: bold;
        }
        
        .generator-history-list {
          background-color: #f5f5f5;
          border: 2px solid #333;
          overflow: hidden;
        }
        
        .generator-history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          border-bottom: 1px solid #333;
          cursor: pointer;
          transition: all 0.2s;
          background-color: #fff;
        }
        
        .generator-history-item:hover {
          background-color: #eaeaea;
        }
        
        .generator-history-item:last-child {
          border-bottom: none;
        }
        
        .generator-history-seed {
          font-family: 'Courier New', monospace;
          color: #0066cc;
          font-size: 14px;
          font-weight: bold;
        }
        
        .generator-history-info {
          font-size: 12px;
          color: #666;
        }
        
        .generator-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-top: 30px;
          padding: 15px;
          background-color: #fff;
          border: 2px solid #333;
        }
        
        .generator-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          text-align: center;
          padding: 10px;
          background-color: #f5f5f5;
          border: 2px solid #333;
        }
        
        .generator-stat-label {
          font-size: 12px;
          color: #666;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .generator-stat-value {
          color: #222;
          font-weight: bold;
          font-size: 16px;
        }

        .generator-disabled-input {
          background-color: #f0f0f0;
          opacity: 0.8;
          cursor: not-allowed;
        }
      `}</style>

      <div className="generator-container">
        <h1 className="generator-title">Генератор сидов Minecraft</h1>
        
        <div className="generator-type-selector">
          <button 
            className={`generator-type-btn ${seedType === 'random' ? 'active' : ''}`}
            onClick={() => setSeedType('random')}
          >
            Случайный
          </button>
          <button 
            className={`generator-type-btn ${seedType === 'text' ? 'active' : ''}`}
            onClick={() => setSeedType('text')}
          >
            Из текста
          </button>
          <button 
            className={`generator-type-btn ${seedType === 'date' ? 'active' : ''}`}
            onClick={() => setSeedType('date')}
          >
            Из даты
          </button>
          <button 
            className={`generator-type-btn ${seedType === 'coordinates' ? 'active' : ''}`}
            onClick={() => setSeedType('coordinates')}
          >
            Координаты
          </button>
          <button 
            className={`generator-type-btn ${seedType === 'biome' ? 'active' : ''}`}
            onClick={() => setSeedType('biome')}
          >
            Для биома
          </button>
        </div>

        {seedType === 'text' && (
          <div className="generator-input-group">
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
          <div className="generator-input-group">
            <label>Доступные биомы:</label>
            <input
              type="text"
              value="plains, desert, jungle, taiga, snowy, ocean"
              disabled
              className="generator-disabled-input"
            />
          </div>
        )}

        {error && <div className="generator-error">{error}</div>}

        <button className="generator-generate-btn" onClick={generateSeed}>
          Сгенерировать сид
        </button>

        {seed && (
          <div className="generator-seed-result">
            <div className="generator-seed-label">Ваш сид</div>
            <div className="generator-seed-value">{seed}</div>
            <button className="generator-copy-btn" onClick={copyToClipboard}>
              Копировать
            </button>
          </div>
        )}

        {history.length > 0 && (
          <div className="generator-history">
            <h3>История</h3>
            <div className="generator-history-list">
              {history.map((item, index) => (
                <div 
                  key={index} 
                  className="generator-history-item"
                  onClick={() => setSeed(item.seed)}
                >
                  <span className="generator-history-seed">{item.seed.substring(0, 12)}...</span>
                  <span className="generator-history-info">{item.type} • {item.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="generator-stats">
          <div className="generator-stat-item">
            <span className="generator-stat-label">Диапазон</span>
            <span className="generator-stat-value">±9.2кв</span>
          </div>
          <div className="generator-stat-item">
            <span className="generator-stat-label">Битов</span>
            <span className="generator-stat-value">64</span>
          </div>
          <div className="generator-stat-item">
            <span className="generator-stat-label">Версии</span>
            <span className="generator-stat-value">Java/Bedrock</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinecraftSeedGenerator;