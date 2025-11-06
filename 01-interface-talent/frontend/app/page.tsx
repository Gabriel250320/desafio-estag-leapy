import { TalentTable } from "@/components/talent-table";
import { TalentPagination } from "@/components/talent-pagination";
import { SearchBar } from "@/components/search-bar";
import { TalentFilters } from "@/components/talent-filters";

type TalentUser = { first_name: string; last_name: string | null; email: string; }
type Leader = { user_id: TalentUser; }
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
type ApiSuccessResponse = {
  data: Talent[];
  meta: { total_count: number; };
}
type ApiFilterResponse = {
  data: { [key: string]: unknown }[];
}

interface TalentFilterOptions {
  search: string;
  department: string;
  status: string;
  pdi_ready: string;
  role: string; 
}

type TargetRole = {
  id: number;
  name: string;
}

type ApiTargetRolesResponse = {
  data: TargetRole[];
}

async function getTalents(page: number, filters: TalentFilterOptions) {
  const API_URL = "http://localhost:8055/items/talents";
  const limit = 10;
  
  const fields = [
    "id", "department", "current_status", "start_date", "end_date",
    "user_id.first_name", "user_id.last_name", "user_id.email",
    "leader_id.user_id.first_name", "leader_id.user_id.last_name",
    "target_role_id.name",
    "target_role_id.name"
  ];

  const params = new URLSearchParams({
    fields: fields.join(','),
    limit: limit.toString(),
    page: page.toString(),
    meta: 'total_count',
  });


  const filterClauses = [];

  if (filters.search) {
    filterClauses.push({
      _or: [
        { user_id: { email: { _contains: filters.search } } },
        { user_id: { first_name: { _contains: filters.search } } },
        { user_id: { last_name: { _contains: filters.search } } },
        { leader_id: { user_id: { first_name: { _contains: filters.search } } } },
        { leader_id: { user_id: { last_name: { _contains: filters.search } } } },
      ],
    });
  }

  if (filters.department) {
    filterClauses.push({
      department: { _eq: filters.department },
    });
  }

  if (filters.status) {
    filterClauses.push({
      current_status: { _eq: filters.status },
    });
  }

  if (filters.pdi_ready === "true") {
  filterClauses.push({
    pdi_plan_ready: { _eq: true },
  });
  } else if (filters.pdi_ready === "false") {
    filterClauses.push({
      pdi_plan_ready: { _eq: false },
    });
  }

  if (filters.role) {
    filterClauses.push({
      target_role_id: { _eq: filters.role },
    });
  }

  if (filterClauses.length > 0) {
    const filterObject = { _and: filterClauses };
    params.append('filter', JSON.stringify(filterObject));
  }
  
  const url = `${API_URL}?${params.toString()}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) { throw new Error(`Falha ao buscar dados: ${res.statusText}`); }
    const data = (await res.json()) as ApiSuccessResponse;
    return { data: data.data, totalCount: data.meta.total_count };
  } catch (error) {
    console.error("Erro ao buscar talentos:", error);
    return { data: [], totalCount: 0 };
  }
}

async function getUniqueDepartments() {
  const url = "http://localhost:8055/items/talents?groupBy=department";
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = (await res.json()) as ApiFilterResponse;
    return data.data.map(item => item.department).filter(Boolean) as string[];
  } catch (error) { console.error("Erro ao buscar departamentos:", error); return []; }
}
async function getUniqueStatuses() {
  const url = "http://localhost:8055/items/talents?groupBy=current_status";
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = (await res.json()) as ApiFilterResponse;
    return data.data.map(item => item.current_status).filter(Boolean) as string[];
  } catch (error) { console.error("Erro ao buscar status:", error); return []; }
}

async function getTargetRolesList() {
  const url = "http://localhost:8055/items/target_roles?fields=id,name&limit=-1";
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = (await res.json()) as ApiTargetRolesResponse;
    return data.data; 
  } catch (error) { 
    console.error("Erro ao buscar cargos alvo:", error); 
    return []; 
  }
}

export interface PageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function Home({ searchParams }: PageProps) {
  const sp = await searchParams;

  const getQueryParam = (param: string | string[] | undefined): string => {
    return Array.isArray(param) ? param[0] : param || "";
  };

  const currentPage = Number(getQueryParam(sp.page)) || 1;
  const currentSearch = getQueryParam(sp.search);
  const currentDepartment = getQueryParam(sp.department);
  const currentStatus = getQueryParam(sp.status);
  const currentPDI = getQueryParam(sp.pdi_ready);
  const currentRole = getQueryParam(sp.role);

  const filters: TalentFilterOptions = {
    search: currentSearch,
    department: currentDepartment,
    status: currentStatus,
    pdi_ready: currentPDI,
    role: currentRole
  };

  const [
    { data: talents, totalCount },
    departments,
    statuses,
    targetRoles
  ] = await Promise.all([
    getTalents(currentPage, filters),
    getUniqueDepartments(),
    getUniqueStatuses(),
    getTargetRolesList()
  ]);

  return (
    <main className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Leapy - Desafio de Talentos</h1>
      
      <div className="mt-6 mb-6">
        <SearchBar />
      </div>
      
      <div className="mb-6">
        <TalentFilters 
          departments={departments}
          statuses={statuses}
          targetRoles={targetRoles}
        />
      </div>
      
      <p className="mt-2 text-gray-600">
        Exibindo {talents.length} de {totalCount} talentos.
      </p>
      
      <div className="mt-8">
        <TalentTable talents={talents} />
      </div>

      <div className="mt-8">
        <TalentPagination
          totalCount={totalCount}
          currentPage={currentPage}
        />
      </div>
    </main>
  );
}