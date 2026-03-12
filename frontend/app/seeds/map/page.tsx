import { PageSection } from "../../components/PageSection";
import { SeedMap } from "../../components/SeedMap";
import "./map.css";

export const metadata = {
  title: "Карта сидов — RuCraft",
  description:
    "Интерактивная онлайн-карта по сиду для Minecraft с биомами, структурами и координатами.",
};

export default function SeedMapPage() {
  return (
    <div className="page-content">
      <PageSection title="Карта сидов">
        <SeedMap />
      </PageSection>
    </div>
  );
}

