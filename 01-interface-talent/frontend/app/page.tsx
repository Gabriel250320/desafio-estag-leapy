// src/app/page.tsx

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
  department: string;
  current_status: string;
  start_date: string;
  end_date: string;
}

async function getTalents() {
  const API_URL = "http://localhost:8055/items/talents";
  
  const fields = [
    "id",
    "department",
    "current_status",
    "start_date",
    "end_date",
    "user_id.first_name",
    "user_id.last_name",
    "user_id.email",
    "leader_id.user_id.first_name",
    "leader_id.user_id.last_name"
  ];

  const url = `${API_URL}?fields=${fields.join(',')}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error(`Falha ao buscar dados: ${res.statusText}`);
    }

    const data = await res.json();
    
    return data.data as Talent[]; 

  } catch (error) {
    console.error("Erro ao buscar talentos:", error);
    return []; 
  }
}

export default async function Home() {
  
  const talents = await getTalents();

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold">Leapy - Desafio de Talentos</h1>
      <p className="mt-2 text-gray-600">
        Total de talentos encontrados: {talents.length}
      </p>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Dados Brutos (Debug):</h2>
        <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
          {JSON.stringify(talents, null, 2)}
        </pre>
      </div>

    </main>
  );
}