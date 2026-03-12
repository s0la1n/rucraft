"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { modsApi } from "@/lib/api";
import "./mods.css";

export function ModsToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [version, setVersion] = useState(searchParams.get("version") || "");
  const [minecraftVersion, setMinecraftVersion] = useState(searchParams.get("minecraft_version") || "");
  
  // Состояния для данных из БД
  const [versions, setVersions] = useState<string[]>([]);
  const [minecraftVersions, setMinecraftVersions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Загружаем версии из БД
  useEffect(() => {
    const loadVersions = async () => {
      try {
        const [versionsRes, mcVersionsRes] = await Promise.all([
          modsApi.getVersions(),
          modsApi.getMinecraftVersions()
        ]);
        setVersions(versionsRes.data);
        setMinecraftVersions(mcVersionsRes.data);
      } catch (error) {
        console.error("Failed to load versions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadVersions();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (version) params.set("version", version);
    if (minecraftVersion) params.set("minecraft_version", minecraftVersion);
    params.set("page", "1");
    
    const queryString = params.toString();
    router.push(`/mods${queryString ? `?${queryString}` : ""}`);
  }, [search, version, minecraftVersion, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
    }
  };

  return (
    <div className="mods-toolbar">
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
        <div className="filter-version">
          <div className="filter-group">
            <label htmlFor="version" className="block text-sm font-medium mb-1">Ядро</label>
            <select 
              id="version"
              value={version} 
              onChange={(e) => setVersion(e.target.value)}
              className="version-input"
              disabled={loading}
            >
              <option value="">Все версии</option>
              {versions.map((v) => (
                <option key={v} value={v}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="minecraft" className="block text-sm font-medium mb-1">Версия</label>
            <select 
              id="minecraft"
              value={minecraftVersion} 
              onChange={(e) => setMinecraftVersion(e.target.value)}
              className="version-input"
              disabled={loading}
            >
              <option value="">Все версии</option>
              {minecraftVersions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}