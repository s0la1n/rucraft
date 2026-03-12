"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RequireAuth } from "../../components/RequireAuth";
import { PageSection } from "../../components/PageSection";
import { modModerationApi, ModModerationRequest, getBackendBaseUrl } from "@/lib/api";

// Функция для получения URL изображения
function getImageUrl(imagePath: string | null): string {
  if (!imagePath) return '/placeholder-skin.png';
  const filename = imagePath.split('/').pop() || '';
  return `${getBackendBaseUrl()}/content-image/mods/${encodeURIComponent(filename)}`;
}

const STATUS_FILTERS = [
  { value: "", label: "Все" },
  { value: "pending", label: "На модерации" },
  { value: "approved", label: "Одобренные" },
  { value: "rejected", label: "Отклоненные" },
] as const;

export default function AdminModsPage() {
  const [requests, setRequests] = useState<ModModerationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<ModModerationRequest | null>(null);
  const [adminComment, setAdminComment] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadRequests = async (page = 1, status = "") => {
    try {
      setLoading(true);
      setError(null);
      const response = await modModerationApi.getMods({ per_page: 12, page, status });
      setRequests(response.data);
      setCurrentPage(response.current_page);
      setLastPage(response.last_page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests(currentPage, statusFilter);
  }, [statusFilter]);

  const handlePageChange = (page: number) => {
    loadRequests(page, statusFilter);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleApprove = async (id: number) => {
    try {
      setActionLoading(id);
      await modModerationApi.approve(id, adminComment || undefined);
      await loadRequests(currentPage, statusFilter);
      setSelectedRequest(null);
      setAdminComment("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Не удалось одобрить мод");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!adminComment.trim()) {
      alert("Укажите причину отклонения");
      return;
    }
    try {
      setActionLoading(id);
      await modModerationApi.reject(id, adminComment);
      await loadRequests(currentPage, statusFilter);
      setSelectedRequest(null);
      setAdminComment("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Не удалось отклонить мод");
    } finally {
      setActionLoading(null);
    }
  };

  const openModal = (request: ModModerationRequest) => {
    setSelectedRequest(request);
    setAdminComment(request.admin_comment || "");
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setAdminComment("");
  };

  return (
    <RequireAuth adminOnly>
      <div className="page-content">
        <Link href="/admin" className="admin-back">
          ← Админ-панель
        </Link>

        <PageSection title="Модерация модов">
          {/* Фильтры */}
          <div className="skins-toolbar" style={{ marginBottom: "20px" }}>
            <div className="skins-filters">
              {STATUS_FILTERS.map(({ value, label }) => (
                <button
                  key={value || "all"}
                  className={`skins-filter-btn ${statusFilter === value ? "active" : ""}`}
                  onClick={() => handleStatusFilterChange(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading && <p>Загрузка...</p>}
          {error && <p className="form-error">{error}</p>}

          {!loading && !error && requests.length === 0 && (
            <p>Заявок на модерацию нет</p>
          )}

          {/* Список заявок */}
          <div className="skins-grid-pages" style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "flex-start" }}>
            {requests.map((request) => {
              const imageUrl = getImageUrl(request.image);
              return (
                <article
                  key={request.id}
                  className="skin-card-page"
                  style={{ cursor: "pointer", overflow: "hidden" }}
                  onClick={() => openModal(request)}
                >
                  <div className="skin-card-image-wrap" style={{ overflow: "hidden" }}>
                    <div className="skin-card-canvas-placeholder" style={{ position: "relative", width: "100%", paddingTop: "100%", overflow: "hidden" }}>
                      <img
                        src={imageUrl}
                        alt={request.title}
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-skin.png';
                        }}
                      />
                    </div>
                  </div>
                  <h3 className="skin-card-name" style={{ fontSize: "14px", fontWeight: "600" }}>{request.title}</h3>
                  <p className="skin-card-category" style={{ fontSize: "12px" }}>Версия: {request.version}</p>
                  <p className="skin-card-category" style={{ fontSize: "12px" }}>Minecraft: {request.minecraft_version || "N/A"}</p>
                  <div className="skin-card-footer">
                    <span className={`status-badge status-${request.status}`}>
                      {request.status === "pending" && "На модерации"}
                      {request.status === "approved" && "Одобрен"}
                      {request.status === "rejected" && "Отклонен"}
                    </span>
                  </div>
                  <p className="skin-card-author" style={{ fontSize: "11px", marginTop: "8px" }}>
                    Автор: {request.user.name}
                  </p>
                </article>
              );
            })}
          </div>

          {/* Пагинация */}
          {lastPage > 1 && (
            <div className="pagination" style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
              <button
                className="btn-secondary"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                ← Назад
              </button>
              <span style={{ alignSelf: "center" }}>
                Страница {currentPage} из {lastPage}
              </span>
              <button
                className="btn-secondary"
                disabled={currentPage === lastPage}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Вперед →
              </button>
            </div>
          )}
        </PageSection>

        {/* Модальное окно просмотра заявки */}
        {selectedRequest && (
          <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true">
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
              <div className="modal-header">
                <h2>Заявка #{selectedRequest.id}</h2>
                <button type="button" className="modal-close" onClick={closeModal} aria-label="Закрыть">
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                  <div style={{ flex: "0 0 200px" }}>
                    <div style={{ width: "200px", height: "200px", position: "relative", background: "#f0f0f0", borderRadius: "8px" }}>
                      <img
                        src={getImageUrl(selectedRequest.image)}
                        alt={selectedRequest.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-skin.png';
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3>{selectedRequest.title}</h3>
                    <p><strong>Версия мода:</strong> {selectedRequest.version}</p>
                    <p><strong>Версия Minecraft:</strong> {selectedRequest.minecraft_version || "N/A"}</p>
                    <p><strong>Автор:</strong> {selectedRequest.user.name} ({selectedRequest.user.login})</p>
                    <p><strong>Статус:</strong>
                      <span className={`status-badge status-${selectedRequest.status}`} style={{ marginLeft: "8px" }}>
                        {selectedRequest.status === "pending" && "На модерации"}
                        {selectedRequest.status === "approved" && "Одобрен"}
                        {selectedRequest.status === "rejected" && "Отклонен"}
                      </span>
                    </p>
                    <p><strong>Дата:</strong> {new Date(selectedRequest.created_at).toLocaleString("ru-RU")}</p>
                    {selectedRequest.description && (
                      <p><strong>Описание:</strong> {selectedRequest.description}</p>
                    )}
                  </div>
                </div>

                {selectedRequest.status === "pending" && (
                  <div className="form-group">
                    <label htmlFor="admin-comment">Комментарий администратора</label>
                    <textarea
                      id="admin-comment"
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      placeholder="Укажите причину отклонения или комментарий"
                      rows={4}
                      style={{ width: "100%", resize: "vertical" }}
                    />
                  </div>
                )}

                {selectedRequest.status === "rejected" && selectedRequest.admin_comment && (
                  <div className="form-group">
                    <label>Причина отклонения</label>
                    <p style={{ padding: "12px", background: "#fee", borderRadius: "8px", color: "#c00" }}>
                      {selectedRequest.admin_comment}
                    </p>
                  </div>
                )}

                {selectedRequest.status === "approved" && selectedRequest.admin_comment && (
                  <div className="form-group">
                    <label>Комментарий администратора</label>
                    <p style={{ padding: "12px", background: "#efe", borderRadius: "8px", color: "#060" }}>
                      {selectedRequest.admin_comment}
                    </p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {selectedRequest.status === "pending" ? (
                  <>
                    <button
                      type="button"
                      className="btn-submit"
                      style={{ background: "#28a745" }}
                      onClick={() => handleApprove(selectedRequest.id)}
                      disabled={actionLoading === selectedRequest.id}
                    >
                      {actionLoading === selectedRequest.id ? "Обработка..." : "✓ Одобрить"}
                    </button>
                    <button
                      type="button"
                      className="btn-submit"
                      style={{ background: "#dc3545" }}
                      onClick={() => handleReject(selectedRequest.id)}
                      disabled={actionLoading === selectedRequest.id}
                    >
                      {actionLoading === selectedRequest.id ? "Обработка..." : "✗ Отклонить"}
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn-secondary" onClick={closeModal}>
                    Закрыть
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
