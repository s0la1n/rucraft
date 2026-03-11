import Link from "next/link";
import Image from "next/image";
import { SkinPost, resolveAssetUrl } from "@/lib/api";

interface SkinCardProps {
  skin: SkinPost;
}

export function SkinCard({ skin }: SkinCardProps) {
  const imageSrc = resolveAssetUrl(skin.image) ?? "/placeholder-skin.png";
  
  return (
    <article className="card group">
      <div className="card-image relative aspect-square overflow-hidden rounded-t-lg">
        <Image
          src={imageSrc}
          alt={skin.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>
      
      <div className="card-body p-4">
        <h3 className="card-title font-semibold truncate">{skin.title}</h3>
        
        <p className="card-meta text-sm text-gray-600 dark:text-gray-400">
          Автор: <span className="font-medium">{skin.author.name}</span>
        </p>
        
        <p className="card-text text-sm text-gray-600 dark:text-gray-400">
          {skin.category}
        </p>
        
        <Link 
          href={`/skins/${skin.id}`} 
          className="btn-link mt-3 inline-flex text-blue-600 hover:underline"
        >
          Подробнее →
        </Link>
      </div>
    </article>
  );
}