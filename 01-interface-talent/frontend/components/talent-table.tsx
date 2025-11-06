"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TalentUser = {
  first_name: string;
  last_name: string | null;
  email: string;
}

type Leader = {
  user_id: TalentUser;
}

type Talent = {
  id: string;
  user_id: TalentUser;
  leader_id: Leader | null;
  department: string | null;
  current_status: string | null;
  start_date: string | null; 
  end_date: string | null;
  target_role_id: TargetRole | null;
}

type TargetRole = {
  id: number;
  name: string;
}

interface TalentTableProps {
  talents: Talent[];
}

function formatDate(dateString: string | null) {
  if (!dateString) return "--";
  try {
    return new Date(dateString).toLocaleDateString('pt-BR');
  } catch (error) {
    console.error("Erro ao formatar data:", dateString, error);
    return "Data Inválida";
  }
}

function getFullName(user: TalentUser) {
  if (!user) return "--";
  return `${user.first_name} ${user.last_name || ''}`.trim();
}

export function TalentTable({ talents }: TalentTableProps) {
  return (
    <Table>
      <TableCaption>Lista de Talentos (1-100 de 100)</TableCaption>
      
      <TableHeader>
        <TableRow>
          <TableHead>Nome do Jovem</TableHead>
          <TableHead>Nome do Líder</TableHead>
          <TableHead>Departamento</TableHead>
          <TableHead>Cargo Alvo</TableHead>
          <TableHead>Início do Contrato</TableHead>
          <TableHead>Fim do Contrato</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {talents.map((talent) => (
          <TableRow key={talent.id}>
            <TableCell className="font-medium">
              {getFullName(talent.user_id)}
            </TableCell>
            
            <TableCell>
              {talent.leader_id ? getFullName(talent.leader_id.user_id) : '--'}
            </TableCell>

            <TableCell>
              {talent.target_role_id ? talent.target_role_id.name : '--'}
            </TableCell>
            
            <TableCell>{talent.department || '--'}</TableCell>
            <TableCell>{formatDate(talent.start_date)}</TableCell>
            <TableCell>{formatDate(talent.end_date)}</TableCell>
            <TableCell>{talent.current_status || '--'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}