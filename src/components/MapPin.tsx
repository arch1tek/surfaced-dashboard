import { useState } from 'react';
import { MapPin as MapPinIcon, Users, AlertTriangle, Car, Zap } from 'lucide-react';

interface MapPinProps {
  lat: number;
  lng: number;
  type: 'traffic' | 'event' | 'safety' | 'transit' | 'utility';
  title: string;
  description: string;
  image?: string;
  intensity?: 'low' | 'medium' | 'high';
  timestamp: number;
}

const PIN_ICONS = {
  traffic: Car,
  event: Users,
  safety: AlertTriangle,
  transit: MapPinIcon,
  utility: Zap,
};

const PIN_COLORS = {
  traffic: 'bg-red-500/90',
  event: 'bg-blue-500/90',
  safety: 'bg-orange-500/90',
  transit: 'bg-green-500/90',
  utility: 'bg-purple-500/90',
};

const MapPin = ({ type, title, description, image, intensity = 'medium', timestamp }: MapPinProps) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const Icon = PIN_ICONS[type];
  const pinColor = PIN_COLORS[type];
  
  const intensityScale = {
    low: 'scale-90',
    medium: 'scale-100',
    high: 'scale-110'
  };
  
  const timeAgo = Math.floor((Date.now() - timestamp) / 1000 / 60); // minutes ago

  return (
    <div className="relative">
      {/* Main pin */}
      <div 
        className={`
          relative w-12 h-12 rounded-full border-3 border-white 
          shadow-floating cursor-pointer transition-all duration-300
          ${intensityScale[intensity]}
          ${isHovered ? 'scale-125' : ''}
          ${intensity === 'high' ? 'animate-pulse-glow' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Pin content */}
        <div className={`w-full h-full rounded-full ${pinColor} overflow-hidden flex items-center justify-center`}>
          {image && !imageError ? (
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Icon className="w-6 h-6 text-white" />
          )}
        </div>
        
        {/* Pulse effect for high intensity */}
        {intensity === 'high' && (
          <div className={`absolute inset-0 rounded-full ${pinColor} animate-ping opacity-75`} />
        )}
      </div>
      
      {/* Hover tooltip */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 animate-fade-in">
          <div className="bg-surface-elevated backdrop-blur-lg rounded-lg px-3 py-2 shadow-floating border border-border min-w-48">
            <h3 className="font-semibold text-sm text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
            <div className="text-xs text-muted-foreground mt-1">
              {timeAgo < 1 ? 'Just now' : `${timeAgo}m ago`}
            </div>
          </div>
          {/* Arrow */}
          <div className="w-2 h-2 bg-surface-elevated border-r border-b border-border transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}
    </div>
  );
};

export default MapPin;