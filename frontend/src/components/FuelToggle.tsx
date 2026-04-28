'use client';

interface Props {
  value: 'gasoline' | 'diesel';
  onChange: (v: 'gasoline' | 'diesel') => void;
}

export default function FuelToggle({ value, onChange }: Props) {
  return (
    <div className="fuel-toggle">
      <button
        className={`fuel-toggle-btn${value === 'gasoline' ? ' active' : ''}`}
        onClick={() => onChange('gasoline')}
      >
        ⛽ Essence
      </button>
      <button
        className={`fuel-toggle-btn${value === 'diesel' ? ' active' : ''}`}
        onClick={() => onChange('diesel')}
      >
        🛢️ Diesel
      </button>
    </div>
  );
}
