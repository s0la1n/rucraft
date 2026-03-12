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
        .container {
          max-width: 650px;
          margin: 7% auto;
          padding: 30px;
          background: linear-gradient(145deg, #fff9e6, #c3f186);
          border-radius: 50px 50px 30px 30px;
          box-shadow: 0 20px 0 #1d4fb9, 0 25px 30px rgba(0,0,0,0.2);
          border: 5px solid #ff8b8b;
          font-family: 'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif;
        }
        
        .title {
          text-align: center;
          color: #ff3399;
          font-size: 20pt;
          margin: 0 0 25px 0;
          text-shadow: 3px 3px 0 #ffcc00, 5px 5px 0 #66ccff;
          transform: rotate(-1deg);
          font-weight: bold;
          letter-spacing: 2px;
        }
        
        .type-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 12px;
          margin-bottom: 25px;
        }
        
        .type-btn {
          padding: 15px 8px;
          background: #ffde59;
          border: 4px solid #ff914d;
          border-radius: 40px 40px 20px 20px;
          color: #333;
          font-size: 8pt;
          font-weight: bold;
          font-family: 'Comic Sans MS', cursive;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 8px 0 #b45f06;
          text-transform: uppercase;
        }
        
        .type-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 13px 0 #b45f06;
          background: #ffeb7a;
        }
        
        .type-btn:active {
          transform: translateY(5px);
          box-shadow: 0 3px 0 #b45f06;
        }
        
        .type-btn.active {
          background: #ffb347;
          border-color: #ff3399;
          box-shadow: 0 8px 0 #cc3366;
          color: white;
        }
        
        .input-group {
          background: #ccf5ff;
          padding: 20px;
          border-radius: 30px;
          border: 4px dashed #66ccff;
          margin-bottom: 25px;
        }
        
        .input-group label {
          display: block;
          margin-bottom: 12px;
          color: #0066cc;
          font-size: 12pt;
          font-weight: bold;
          text-shadow: 2px 2px 0 #ffcc00;
        }
        
        .input-group input {
          width: 100%;
          padding: 18px 20px;
          background: white;
          border: 5px solid #66ccff;
          border-radius: 60px;
          color: #333;
          font-size: 12pt;
          font-family: 'Comic Sans MS', cursive;
          transition: all 0.2s;
          box-shadow: inset 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .input-group input:focus {
          outline: none;
          border-color: #ff99cc;
          background: #fff0f5;
          transform: scale(1.02);
        }
        
        .input-group input::placeholder {
          color: #99ccff;
        }
        
        .generate-btn {
          width: 100%;
          padding: 20px;
          background: linear-gradient(145deg, #00ff99, #33ccff);
          border: none;
          border-radius: 60px;
          color: white;
          font-size: 18pt;
          font-weight: bold;
          font-family: 'Comic Sans MS', cursive;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 30px;
          text-shadow: 3px 3px 0 #009966;
          box-shadow: 0 15px 0 #0099cc, 0 10px 20px rgba(0,0,0,0.2);
          text-transform: uppercase;
          letter-spacing: 3px;
        }
        
        .generate-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 0 #0099cc, 0 15px 25px rgba(0,0,0,0.2);
        }
        
        .generate-btn:active {
          transform: translateY(10px);
          box-shadow: 0 5px 0 #0099cc, 0 10px 20px rgba(0,0,0,0.2);
        }
        
        .seed-result {
          background: linear-gradient(45deg, #ffff99, #ffccff);
          padding: 25px;
          border-radius: 40px;
          text-align: center;
          border: 8px solid #ff66b2;
          margin-bottom: 30px;
          box-shadow: 0 10px 0 #cc3399;
        }
        
        .seed-label {
          color: #663399;
          margin-bottom: 15px;
          font-size: 20px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .seed-value {
          font-size: 36px;
          color: #ff3399;
          word-break: break-all;
          font-family: 'Courier New', monospace;
          margin-bottom: 20px;
          background: white;
          padding: 20px;
          border-radius: 30px;
          border: 5px solid #66ccff;
          box-shadow: inset 0 0 20px #ffcc00;
        }
        
        .copy-btn {
          padding: 15px 40px;
          background: #66ff66;
          border: 6px solid #ffcc00;
          border-radius: 60px;
          color: #333;
          font-size: 24px;
          font-weight: bold;
          font-family: 'Comic Sans MS', cursive;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 10px 0 #339933;
        }
        
        .copy-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 13px 0 #339933;
          background: #7aff7a;
        }
        
        .copy-btn:active {
          transform: translateY(7px);
          box-shadow: 0 3px 0 #339933;
        }
        
        .error {
          color: #ff3333;
          padding: 15px;
          background: #ffeeaa;
          border: 5px solid #ff6666;
          border-radius: 40px;
          margin-bottom: 20px;
          text-align: center;
          font-size: 20px;
          font-weight: bold;
        }
        
        .history {
          margin-top: 30px;
          background: #e6ccff;
          padding: 25px;
          border-radius: 40px;
          border: 6px dotted #aa80ff;
        }
        
        .history h3 {
          color: #663366;
          margin: 0 0 15px 0;
          font-size: 28px;
          text-align: center;
          text-shadow: 2px 2px 0 #ff99cc;
        }
        
        .history-list {
          background: #ffd9b3;
          border-radius: 30px;
          border: 5px solid #ff9933;
          overflow: hidden;
        }
        
        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 3px dashed #ff9933;
          cursor: pointer;
          transition: all 0.2s;
          background: #fff0d4;
        }
        
        .history-item:hover {
          background: #ffe6b3;
          transform: scale(1.02);
          padding-left: 30px;
        }
        
        .history-item:last-child {
          border-bottom: none;
        }
        
        .history-seed {
          font-family: 'Courier New', monospace;
          color: #cc3300;
          font-size: 18px;
          font-weight: bold;
        }
        
        .history-info {
          font-size: 16px;
          color: #ff6600;
        }
        
        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-top: 30px;
          padding: 20px;
          background: #b3e6ff;
          border-radius: 50px;
          border: 5px solid #0099ff;
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
          background: white;
          padding: 12px;
          border-radius: 25px;
          box-shadow: 0 5px 0 #0099cc;
        }
        
        .stat-label {
          font-size: 14px;
          color: #333;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .stat-value {
          color: #ff3399;
          font-weight: bold;
          font-size: 18px;
        }

        .disabled-input {
          background: #fff0f0;
          opacity: 0.8;
          cursor: not-allowed;
        }
      `}</style>

      <div className="container">
        <h1 className="title">Генератор сидиков Minecraft</h1>
        
        <div className="type-selector">
          <button 
            className={`type-btn ${seedType === 'random' ? 'active' : ''}`}
            onClick={() => setSeedType('random')}
          >
            Случайный
          </button>
          <button 
            className={`type-btn ${seedType === 'text' ? 'active' : ''}`}
            onClick={() => setSeedType('text')}
          >
            Из текста
          </button>
          <button 
            className={`type-btn ${seedType === 'date' ? 'active' : ''}`}
            onClick={() => setSeedType('date')}
          >
            Из даты
          </button>
          <button 
            className={`type-btn ${seedType === 'coordinates' ? 'active' : ''}`}
            onClick={() => setSeedType('coordinates')}
          >
            Координаты
          </button>
          <button 
            className={`type-btn ${seedType === 'biome' ? 'active' : ''}`}
            onClick={() => setSeedType('biome')}
          >
            Для биома
          </button>
        </div>

        {seedType === 'text' && (
          <div className="input-group">
            <label>Напиши что-нибудь волшебное:</label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Например: мой классный мир"
              onKeyPress={handleKeyPress}
            />
          </div>
        )}

        {seedType === 'biome' && (
          <div className="input-group">
            <label>Волшебные биомы:</label>
            <input
              type="text"
              value="равнины, пустыня, джунгли, тайга, снега, океан"
              disabled
              className="disabled-input"
            />
          </div>
        )}

        {error && <div className="error"> {error}</div>}

        <button className="generate-btn" onClick={generateSeed}>
           Создать сидик 
        </button>

        {seed && (
          <div className="seed-result">
            <div className="seed-label">Твой волшебный сид:</div>
            <div className="seed-value">{seed}</div>
            <button className="copy-btn" onClick={copyToClipboard}>
              Скопировать
            </button>
          </div>
        )}

        {history.length > 0 && (
          <div className="history">
            <h3>История твоих сидиков</h3>
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
          <div className="stat-item">
            <span className="stat-label">Диапазон</span>
            <span className="stat-value">±9.2кв</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Битов</span>
            <span className="stat-value">64</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Версии</span>
            <span className="stat-value">Java/Bedrock</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinecraftSeedGenerator;