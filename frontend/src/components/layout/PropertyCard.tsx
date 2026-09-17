import React from 'react';
import { Building2 } from 'lucide-react';
import type { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
  totalRooms: number;
  occupiedRooms: number;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, totalRooms, occupiedRooms }) => {
  return (
    <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md transition-all rounded-2xl p-3.5 border border-white/15 text-white shadow-lg shadow-black/10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-blue-200 shadow-inner">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-wide truncate max-w-[130px] font-prompt">{property.name}</h4>
            <p className="text-[11px] text-blue-200/80">ห้องพัก {totalRooms} ห้อง | มีผู้เช่า {occupiedRooms} ห้อง</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <span className="text-[11px] text-blue-200/70">ประเภท: {property.typeLabel || 'ยังไม่กำหนดประเภท'}</span>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-300/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          {property.plan}
        </span>
      </div>
    </div>
  );
};
