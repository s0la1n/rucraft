"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { buildsApi } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { AddBuildModal } from "./AddBuildModal";
import "./builds.css";

const DIFFICULTIES = [
  { value: "легкая", label: "для нубов" },
  { value: "обычная", label: "для про" },
  { value: "сложная", label: "для админов" }
] as const;

export function BuildsToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [addModalOpen, setAddModalOpen] = useState(false);
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "легкая");
  
  // Состояния для данных из БД
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Загружаем сложности из БД
  useEffect(() => {
    const loadDifficulties = async () => {
      try {
        const res = await buildsApi.getDifficulties();
        setDifficulties(res.data);
      } catch (error) {
        console.error("Failed to load difficulties:", error);
        setDifficulties(DIFFICULTIES.map(d => d.value));
      } finally {
        setLoading(false);
      }
    };
    
    loadDifficulties();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (difficulty) params.set("difficulty", difficulty);
    params.set("page", "1");
    
    const queryString = params.toString();
    router.push(`/builds${queryString ? `?${queryString}` : ""}`);
  }, [search, difficulty, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
    }
  };

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value);
  };

  const getLabelByValue = (value: string) => {
    const found = DIFFICULTIES.find(d => d.value === value);
    return found ? found.label : value;
  };

  return (
    <>
      <div className="builds-toolbar">
        {user != null && (
          <div className="add-button-container" style={{ width: '100%', marginBottom: '15px' }}>
            <button 
              type="button" 
              className="skins-action-btn" 
              onClick={() => setAddModalOpen(true)}
              style={{ width: '100%' }}
            >
              Добавить постройку
            </button>
          </div>
        )}
        
        <div className="filters">
          <div className="filter-group search-group">
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="поискать"
              className="search-input"
            />
          </div>
          
          <div className="difficulty-group">
            <div className="difficulty-options">
              {difficulties.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`difficulty-btn ${difficulty === value ? 'active' : ''}`}
                  onClick={() => handleDifficultyChange(value)}
                >
                  {getLabelByValue(value)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AddBuildModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSuccess={() => router.refresh()} />
    </>
  );
}