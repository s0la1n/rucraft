"use client";
import "../builds.css";

type CraftModalProps = {
  blockName: string | null;
  onClose: () => void;
  recipe: any | null;
};

// SVG иконки для блоков
const BlockIcons = {
  stone: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="5" width="30" height="30" fill="#a1a1a1" stroke="#555" strokeWidth="2" />
      <circle cx="15" cy="15" r="3" fill="#7a7a7a" />
      <circle cx="28" cy="25" r="4" fill="#7a7a7a" />
      <rect x="10" y="25" width="12" height="5" fill="#7a7a7a" />
    </svg>
  ),
  cobblestone: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="5" width="30" height="30" fill="#8a8a8a" stroke="#555" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="#6a6a6a" />
      <circle cx="28" cy="18" r="5" fill="#6a6a6a" />
      <circle cx="18" cy="28" r="4" fill="#6a6a6a" />
      <circle cx="30" cy="30" r="3" fill="#6a6a6a" />
    </svg>
  ),
  planks: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="5" width="30" height="30" fill="#c4a484" stroke="#8b5a2b" strokeWidth="2" />
      <line x1="5" y1="15" x2="35" y2="15" stroke="#8b5a2b" strokeWidth="2" />
      <line x1="5" y1="25" x2="35" y2="25" stroke="#8b5a2b" strokeWidth="2" />
      <line x1="15" y1="5" x2="15" y2="35" stroke="#8b5a2b" strokeWidth="2" />
      <line x1="25" y1="5" x2="25" y2="35" stroke="#8b5a2b" strokeWidth="2" />
    </svg>
  ),
  stick: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="17" y="5" width="6" height="30" fill="#b08d57" stroke="#6b4f2e" strokeWidth="2" />
      <circle cx="20" cy="10" r="3" fill="#8b5a2b" />
      <circle cx="20" cy="30" r="3" fill="#8b5a2b" />
    </svg>
  ),
  sandstone: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="5" width="30" height="30" fill="#d2b48c" stroke="#8b6b4f" strokeWidth="2" />
      <rect x="10" y="10" width="8" height="8" fill="#b89a7a" />
      <rect x="22" y="10" width="8" height="8" fill="#b89a7a" />
      <rect x="10" y="22" width="8" height="8" fill="#b89a7a" />
      <rect x="22" y="22" width="8" height="8" fill="#b89a7a" />
    </svg>
  ),
  glass: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="5" width="30" height="30" fill="#e0f2fe" stroke="#7aa2b7" strokeWidth="2" fillOpacity="0.5" />
      <line x1="5" y1="15" x2="35" y2="15" stroke="#7aa2b7" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="5" y1="25" x2="35" y2="25" stroke="#7aa2b7" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="15" y1="5" x2="15" y2="35" stroke="#7aa2b7" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="25" y1="5" x2="25" y2="35" stroke="#7aa2b7" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  ),
  whiteConcrete: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="5" width="30" height="30" fill="#f0f0f0" stroke="#aaa" strokeWidth="2" />
      <circle cx="15" cy="15" r="2" fill="#d0d0d0" />
      <circle cx="25" cy="25" r="2" fill="#d0d0d0" />
      <circle cx="28" cy="12" r="2" fill="#d0d0d0" />
      <circle cx="12" cy="28" r="2" fill="#d0d0d0" />
    </svg>
  ),
  purpur: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="5" width="30" height="30" fill="#b45f9b" stroke="#6b3f5a" strokeWidth="2" />
      <circle cx="15" cy="15" r="4" fill="#9e4b84" />
      <circle cx="28" cy="25" r="3" fill="#9e4b84" />
      <circle cx="22" cy="30" r="3" fill="#9e4b84" />
      <circle cx="30" cy="12" r="3" fill="#9e4b84" />
    </svg>
  ),
  prismarine: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="5" width="30" height="30" fill="#3b9e9e" stroke="#1f6b6b" strokeWidth="2" />
      <path d="M10 10 L20 10 L15 18 Z" fill="#2c7a7a" />
      <path d="M22 15 L32 15 L27 23 Z" fill="#2c7a7a" />
      <path d="M12 25 L22 25 L17 33 Z" fill="#2c7a7a" />
      <path d="M25 28 L35 28 L30 36 Z" fill="#2c7a7a" />
    </svg>
  ),
  concrete: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="5" width="30" height="30" fill="#7a7a7a" stroke="#4a4a4a" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" fill="#5a5a5a" />
      <circle cx="28" cy="18" r="4" fill="#5a5a5a" />
      <circle cx="18" cy="28" r="3" fill="#5a5a5a" />
      <circle cx="30" cy="30" r="2" fill="#5a5a5a" />
    </svg>
  ),
  wood: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="5" width="30" height="30" fill="#8b5a2b" stroke="#5d3f1e" strokeWidth="2" />
      <circle cx="15" cy="15" r="5" fill="#b08d57" />
      <circle cx="25" cy="25" r="6" fill="#b08d57" />
      <line x1="10" y1="8" x2="18" y2="16" stroke="#5d3f1e" strokeWidth="2" />
      <line x1="22" y1="22" x2="30" y2="30" stroke="#5d3f1e" strokeWidth="2" />
    </svg>
  ),
  sprucePlanks: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="5" width="30" height="30" fill="#7c5e3a" stroke="#4a3722" strokeWidth="2" />
      <line x1="5" y1="12" x2="35" y2="12" stroke="#4a3722" strokeWidth="2" />
      <line x1="5" y1="22" x2="35" y2="22" stroke="#4a3722" strokeWidth="2" />
      <line x1="5" y1="32" x2="35" y2="32" stroke="#4a3722" strokeWidth="2" />
      <line x1="15" y1="5" x2="15" y2="35" stroke="#4a3722" strokeWidth="2" />
      <line x1="25" y1="5" x2="25" y2="35" stroke="#4a3722" strokeWidth="2" />
    </svg>
  ),
  dirt: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="5" width="30" height="30" fill="#6b4f32" stroke="#3e2e1e" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" fill="#8b5a2b" />
      <circle cx="25" cy="18" r="4" fill="#8b5a2b" />
      <circle cx="20" cy="28" r="3" fill="#8b5a2b" />
      <circle cx="30" cy="25" r="2" fill="#8b5a2b" />
      <circle cx="15" cy="25" r="2" fill="#8b5a2b" />
    </svg>
  ),
  default: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="5" width="30" height="30" fill="#c6c6c6" stroke="#555" strokeWidth="2" />
      <text x="20" y="25" textAnchor="middle" fill="#333" fontSize="16">?</text>
    </svg>
  )
};

// Функция получения SVG по имени блока
const getBlockSvg = (blockName: string): JSX.Element => {
  const map: Record<string, keyof typeof BlockIcons> = {
    "булыжник": "cobblestone",
    "камень": "stone",
    "каменный кирпич": "stone",
    "доски": "planks",
    "палка": "stick",
    "песчаник": "sandstone",
    "стекло": "glass",
    "белый бетон": "whiteConcrete",
    "пурпурный блок": "purpur",
    "призмарин": "prismarine",
    "бетон": "concrete",
    "дерево": "wood",
    "еловые доски": "sprucePlanks",
    "земля": "dirt",
  };
  
  const key = map[blockName.toLowerCase()];
  return BlockIcons[key as keyof typeof BlockIcons] || BlockIcons.default;
};

export function CraftModal({ blockName, onClose, recipe }: CraftModalProps) {
  if (!blockName) return null;

  return (
    <div className="craft-modal-overlay" onClick={onClose}>
      <div className="craft-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="craft-modal-header">
          <h3>Крафт: {blockName}</h3>
          <button className="craft-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="craft-modal-body">
          {recipe ? (
            <div className="crafting-table">
              {/* Верстак 3x3 */}
              <div className="crafting-grid">
                {[0, 1, 2].map((row) => (
                  [0, 1, 2].map((col) => {
                    const patternRow = recipe.pattern[row] || "   ";
                    const char = patternRow[col] || " ";
                    const ingredient = recipe.ingredients[char];
                    
                    return (
                      <div key={`${row}-${col}`} className="crafting-slot">
                        {ingredient && (
                          <div className="crafting-item">
                            <div className="crafting-item-icon">
                              {getBlockSvg(ingredient)}
                            </div>
                            <span className="crafting-item-name">{ingredient}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ))}
              </div>
              
              {/* Стрелка */}
              <div className="crafting-arrow">→</div>
              
              {/* Результат */}
              <div className="crafting-result">
                <div className="crafting-slot result-slot">
                  <div className="crafting-item">
                    <div className="crafting-item-icon">
                      {getBlockSvg(blockName)}
                    </div>
                    <span className="crafting-item-name">{recipe.result}</span>
                    <span className="crafting-item-count">{recipe.count}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="craft-no-recipe">Рецепт для &quot;{blockName}&quot; пока не добавлен</p>
          )}
        </div>
      </div>
    </div>
  );
}