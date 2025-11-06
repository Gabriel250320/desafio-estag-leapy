"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

type TargetRole = {
  id: number;
  name: string;
}

interface TalentFiltersProps {
  departments: string[];
  statuses: string[];
  targetRoles: TargetRole[];
}

export function TalentFilters({ departments, statuses, targetRoles }: TalentFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");

    router.push(`?${params.toString()}`);
    router.refresh();
  };

  return (
    <div className="flex flex-wrap gap-4">
      <Select
        value={searchParams.get("department") || "all"}
        onValueChange={(value) => {
          handleFilterChange("department", value);
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Departamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Departamentos: Todos</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept} value={dept}>
              {dept}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("status") || "all"}
        onValueChange={(value) => {
          handleFilterChange("status", value);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Status: Todos</SelectItem>
  
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("pdi_ready") || "all"}
        onValueChange={(value) => {
          handleFilterChange("pdi_ready", value);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="PDI Pronto?" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">PDI: Todos</SelectItem>
          <SelectItem value="true">Sim</SelectItem>
          <SelectItem value="false">Não</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("role") || "all"}
        onValueChange={(value) => {
          handleFilterChange("role", value);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Cargo Alvo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Cargos: Todos</SelectItem>
          {targetRoles.map((role) => (
            // IMPORTANTE: O "valor" do item é o ID (ex: 1),
            // mas o texto que o usuário vê é o NOME (ex: "Dev")
            <SelectItem key={role.id} value={role.id.toString()}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}