"use client";

type CraftModalProps = {
  blockName: string;
  requiredCount: number;
  onClose: () => void;
  recipe: any;
  getBlockClass: (name: string) => string;
};

export function CraftModal({ blockName, requiredCount, onClose, recipe, getBlockClass }: CraftModalProps) {
  if (!blockName) return null;

  const calculateIngredients = () => {
    const ingredientsNeeded: Record<string, number> = {};
    const craftsNeeded = Math.ceil(requiredCount / recipe.count);
    
    Object.entries(recipe.ingredients).forEach(([_, ingredientName]) => {
      const ingredient = ingredientName as string;
      ingredientsNeeded[ingredient] = (ingredientsNeeded[ingredient] || 0) + craftsNeeded;
    });
    
    return ingredientsNeeded;
  };

  const ingredientsNeeded = calculateIngredients();
  const craftsNeeded = Math.ceil(requiredCount / recipe.count);

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
                            <span className={`item ${getBlockClass(ingredient)}`} style={{ width: '32px', height: '32px' }}></span>
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
                    <span className={`item ${getBlockClass(blockName)}`} style={{ width: '32px', height: '32px' }}></span>
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
        
        {/* Информация о необходимых ресурсах */}
        <div className="crafting-info">
          <p className="crafting-need">Нужно скрафтить: {craftsNeeded} раз(а)</p>
          <p className="crafting-need-title">Всего потребуется ресурсов:</p>
          <div className="crafting-summary">
            {Object.entries(ingredientsNeeded).map(([ingredient, count]) => (
              <div key={ingredient} className="summary-item">
                <span className={`item ${getBlockClass(ingredient)}`} style={{ width: '32px', height: '32px' }}></span>
                <span className="summary-item-name">{ingredient}</span>
                <span className="summary-item-count">{count} шт.</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}