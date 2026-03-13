"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/app/components/RequireAuth";
import { PageSection } from "@/app/components/PageSection";
import { analyticsApi, type AnalyticsResponse } from "@/lib/api";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import "../admin.css";

const COLORS = [
  "#FF0000",
  "#0000FF",
  "#FFFFFF",
  "#FFFF00",
];

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div
      className="stat-card"
      style={{
        background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
        border: `2px solid ${color}`,
        borderRadius: "12px",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "20px", fontFamily: "Comic Sans MS", color: "#FFFFFF", marginBottom: "8px" }}>{title}</div>
      <div style={{ fontSize: "30px", fontWeight: 500, fontFamily: "Impact", color }}>{value}</div>
    </div>
  );
}

function ChartCard({ title, children, width = "100%", height = 300 }: { title: string; children: React.ReactNode; width?: string; height?: number }) {
  return (
    <div
      className="chart-card"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        border: "2px solid #FFFFFF33",
        borderRadius: "12px",
        padding: "20px",
        width,
      }}
    >
      <h3 style={{ marginBottom: "20px", fontSize: "30px", fontFamily: "Impact", fontWeight: 500, color: "#FFFFFF" }}>{title}</h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyticsApi
      .index()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <RequireAuth adminOnly>
        <div className="page-content">
          <PageSection title="Аналитика">
            <p>Загрузка данных…</p>
          </PageSection>
        </div>
      </RequireAuth>
    );
  }

  if (error) {
    return (
      <RequireAuth adminOnly>
        <div className="page-content">
          <PageSection title="Аналитика">
            <p style={{ color: "#ef4444" }}>Ошибка: {error}</p>
          </PageSection>
        </div>
      </RequireAuth>
    );
  }

  if (!data) {
    return null;
  }

  const { summary, skins_by_category, skins_by_status, users_by_role, new_users_by_month, content_by_type } = data;

  return (
    <RequireAuth adminOnly>
      <div className="page-content">
        <PageSection title="Аналитика">
          <p style={{ marginBottom: "24px", color: "#FFFFFF", fontSize: "20px", fontFamily: "Comic Sans MS" }}>
            Статистика по пользователям, контенту и тегам
          </p>

          {/* Карточки статистики */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <StatCard title="Всего пользователей" value={summary.total_users} color="#FF0000" />
            <StatCard title="Активных" value={summary.active_users} color="#0000FF" />
            <StatCard title="В бане" value={summary.banned_users} color="#FF0000" />
            <StatCard title="Скинов" value={summary.total_skins} color="#FFFF00" />
            <StatCard title="Построек" value={summary.total_builds} color="#FFFFFF" />
            <StatCard title="Модов" value={summary.total_modes} color="#0000FF" />
            <StatCard title="Сидов" value={summary.total_seeds} color="#FFFF00" />
          </div>

          {/* Графики */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            {/* Контент по типам */}
            <ChartCard title="Контент по типам">
              <PieChart>
                <Pie
                  data={content_by_type}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {content_by_type.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ChartCard>

            {/* Пользователи по ролям */}
            <ChartCard title="Пользователи по ролям">
              <PieChart>
                <Pie
                  data={users_by_role}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {users_by_role.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ChartCard>

            {/* Скины по категориям */}
            <ChartCard title="Скины по категориям">
              <BarChart data={skins_by_category}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#FFFFFF" angle={-45} textAnchor="end" height={80} interval={0} />
                <YAxis stroke="#FFFFFF" />
                <Tooltip />
                <Bar dataKey="value" fill="#FF0000" name="Количество" />
              </BarChart>
            </ChartCard>

            {/* Скины по статусам */}
            <ChartCard title="Скины по статусам">
              <BarChart data={skins_by_status}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#FFFFFF" />
                <YAxis stroke="#FFFFFF" />
                <Tooltip />
                <Bar dataKey="value" fill="#0000FF" name="Количество" />
              </BarChart>
            </ChartCard>
          </div>

          {/* График новых пользователей по месяцам */}
          <ChartCard title="Новые пользователи по месяцам (за последние 12 месяцев)" height={350}>
            <LineChart data={new_users_by_month}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" stroke="#FFFFFF" />
              <YAxis stroke="#FFFFFF" allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#FFFF00" strokeWidth={3} name="Пользователей" />
            </LineChart>
          </ChartCard>
        </PageSection>
      </div>
    </RequireAuth>
  );
}
