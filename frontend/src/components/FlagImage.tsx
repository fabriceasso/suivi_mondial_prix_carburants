import Image from 'next/image';
import { getFlagUrl, getFlagEmoji } from '@/lib/flags';

interface FlagImageProps {
  countryName: string;
  countryCode?: string | null;
  size?: number;
  className?: string;
  alt?: string;
}

export default function FlagImage({
  countryName,
  countryCode,
  size = 24,
  className = '',
  alt
}: FlagImageProps) {
  const flagUrl = getFlagUrl(countryName);

  if (flagUrl) {
    return (
      <Image
        src={flagUrl}
        alt={alt || `Drapeau de ${countryName}`}
        width={size}
        height={size}
        className={`inline-block rounded-sm ${className}`}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  // Fallback vers emoji si pas de drapeau disponible
  return (
    <span
      className={`inline-block ${className}`}
      style={{ fontSize: `${size * 0.75}px`, lineHeight: 1 }}
    >
      {getFlagEmoji(countryCode || '')}
    </span>
  );
}