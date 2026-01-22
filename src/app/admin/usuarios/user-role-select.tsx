'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserRoleSelectProps {
  userId: string;
  currentRole: string;
}

export function UserRoleSelect({ userId, currentRole }: UserRoleSelectProps) {
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);

  const handleChange = async (newRole: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setRole(newRole);
      }
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (r: string) => {
    return r === 'admin'
      ? 'bg-rose-50 text-rose-600 border-rose-200'
      : 'bg-blue-50 text-blue-600 border-blue-200';
  };

  return (
    <Select value={role} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger
        className={`w-32 h-8 text-xs border ${getRoleBadgeColor(role)}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className='bg-white border-slate-200'>
        <SelectItem value='candidate'>Candidato</SelectItem>
        <SelectItem value='admin'>Admin</SelectItem>
      </SelectContent>
    </Select>
  );
}
