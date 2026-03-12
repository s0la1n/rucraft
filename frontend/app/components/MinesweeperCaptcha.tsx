"use client";

import { useState, useEffect } from "react";

const BOARD_SIZE = 5;
const MINES_COUNT = 3;

const INSULTS = [
  "Как всегда дристня, брат",
  "Джарвис че за херня",
  "Дальше - меньше",
  "Ни шагу вперед!",
  "На зоне таких по кругу пускают!",
  "Говно, переделывай",
  "Фу, коза"
];

type MinesweeperCaptchaProps = {
  onVerify: (passed: boolean) => void;
};

export function MinesweeperCaptcha({ onVerify }: MinesweeperCaptchaProps) {
  const [board, setBoard] = useState<number[][]>([]);
  const [revealed, setRevealed] = useState<boolean[][]>([]);
  const [flags, setFlags] = useState<boolean[][]>([]);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [insult, setInsult] = useState<string | null>(null);
  const [flagMode, setFlagMode] = useState(false);
  const [minesFound, setMinesFound] = useState(0);

  useEffect(() => {
    createNewGame();
  }, []);

  useEffect(() => {
    if (gameState === "won") {
      onVerify(true);
    } else if (gameState === "lost") {
      onVerify(false);
    }
  }, [gameState]);

  function createNewGame() {
    const newBoard: number[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    const newRevealed: boolean[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));
    const newFlags: boolean[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));

    let minesPlaced = 0;
    while (minesPlaced < MINES_COUNT) {
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);

      if (newBoard[row][col] !== -1) {
        newBoard[row][col] = -1;
        minesPlaced++;

        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;

            if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE && newBoard[newRow][newCol] !== -1) {
              newBoard[newRow][newCol]++;
            }
          }
        }
      }
    }

    setBoard(newBoard);
    setRevealed(newRevealed);
    setFlags(newFlags);
    setGameState("playing");
    setInsult(null);
    setMinesFound(0);
    setFlagMode(false);
  }

  function handleCellClick(row: number, col: number) {
    if (gameState !== "playing" || revealed[row][col]) return;

    if (flagMode) {
      toggleFlag(row, col);
    } else {
      revealCell(row, col);
    }
  }

  function handleContextMenu(e: React.MouseEvent, row: number, col: number) {
    e.preventDefault();
    if (gameState !== "playing" || revealed[row][col]) return;
    toggleFlag(row, col);
  }

  function toggleFlag(row: number, col: number) {
    const newFlags = flags.map(r => [...r]);
    newFlags[row][col] = !newFlags[row][col];
    setFlags(newFlags);

    if (board[row][col] === -1) {
      const newMinesFound = newFlags[row][col] ? minesFound + 1 : minesFound - 1;
      setMinesFound(newMinesFound);

      if (newMinesFound === MINES_COUNT) {
        let allMinesFlagged = true;
        for (let i = 0; i < BOARD_SIZE; i++) {
          for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === -1 && !newFlags[i][j]) {
              allMinesFlagged = false;
              break;
            }
            if (board[i][j] !== -1 && newFlags[i][j]) {
              allMinesFlagged = false;
              break;
            }
          }
        }

        if (allMinesFlagged) {
          setGameState("won");
          onVerify(true);
        }
      }
    }
  }

  function revealCell(row: number, col: number) {
    if (gameState !== "playing" || revealed[row][col] || flags[row][col]) return;

    const newRevealed = revealed.map(r => [...r]);
    newRevealed[row][col] = true;
    setRevealed(newRevealed);

    if (board[row][col] === -1) {
      setGameState("lost");
      setInsult(INSULTS[Math.floor(Math.random() * INSULTS.length)]);
      onVerify(false);
      return;
    }

    const totalSafeCells = BOARD_SIZE * BOARD_SIZE - MINES_COUNT;
    const revealedCount = newRevealed.flat().filter(cell => cell).length;

    if (revealedCount === totalSafeCells) {
      setGameState("won");
      onVerify(true);
    }

    if (board[row][col] === 0) {
      revealNeighbors(row, col, newRevealed);
    }
  }

  function revealNeighbors(row: number, col: number, currentRevealed: boolean[][]) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i;
        const newCol = col + j;

        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE &&
            !currentRevealed[newRow][newCol] && !flags[newRow][newCol] && board[newRow][newCol] !== -1) {

          currentRevealed[newRow][newCol] = true;
          setRevealed(currentRevealed.map(r => [...r]));

          if (board[newRow][newCol] === 0) {
            revealNeighbors(newRow, newCol, currentRevealed);
          }
        }
      }
    }
  }

  function getCellColor(value: number): string {
    switch(value) {
      case 1: return "blue";
      case 2: return "green";
      case 3: return "red";
      case 4: return "navy";
      default: return "black";
    }
  }

  return (
    <div className="captcha-container">
      <p className="captcha-title">Подтвердите, что вы не робот — сыграйте в сапёра</p>
      <p className="captcha-hint">Найдите все безопасные клетки (мин: {MINES_COUNT})</p>

      <div className="mode-indicator" onClick={() => setFlagMode(!flagMode)}>
        {flagMode ? "🚩 Режим флажков" : "🔨 Режим открытия"}
      </div>

      <div className="minesweeper-board">
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <button
              key={String(rowIndex) + "-" + String(colIndex)}
              type="button"
              className={"minesweeper-cell " + (revealed[rowIndex][colIndex] ? "revealed" : "") + (flags[rowIndex][colIndex] ? " flagged" : "")}
              style={{
                backgroundColor: flags[rowIndex][colIndex] ? "#ffd700" : revealed[rowIndex][colIndex] ? "#fff" : "#ccc",
                borderColor: revealed[rowIndex][colIndex] ? "#999" : "#fff #666 #666 #fff",
                color: revealed[rowIndex][colIndex] && cell !== 0 && cell !== -1 ? getCellColor(cell) : "black",
              }}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              onContextMenu={(e) => handleContextMenu(e, rowIndex, colIndex)}
              disabled={revealed[rowIndex][colIndex] || gameState !== "playing"}
            >
              {flags[rowIndex][colIndex] && "🚩"}
              {revealed[rowIndex][colIndex] && cell !== 0 && cell !== -1 && cell}
              {revealed[rowIndex][colIndex] && cell === -1 && "💣"}
            </button>
          ))
        ))}
      </div>

      <div className={"captcha-status " + (gameState === "won" ? "won" : gameState === "lost" ? "lost" : "")}>
        {gameState === "playing" && `Играем... (Флажков: ${minesFound}/${MINES_COUNT})`}
        {gameState === "won" && "✅ Победа! Вы человек!"}
        {gameState === "lost" && "💥 Бум! Попробуйте еще раз"}
      </div>

      {insult && <p className="captcha-insult">{insult}</p>}

      <div className="captcha-button-container">
        <button
          type="button"
          className="captcha-mode-btn"
          onClick={() => setFlagMode(!flagMode)}
        >
          {flagMode ? "🔨 Режим открытия" : "🚩 Режим флажков"}
        </button>
        <button
          type="button"
          className="captcha-retry-btn"
          onClick={createNewGame}
          disabled={gameState === "playing"}
        >
          Новая игра
        </button>
      </div>
    </div>
  );
}
