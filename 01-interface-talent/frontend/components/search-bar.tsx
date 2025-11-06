"use client";

import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // "estado" para guardar o que o usuário está digitando
  const [query, setQuery] = useState(searchParams.get('search') || '');

  // lógica de debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      // Verifica se a busca mudou
      if (query) {
        params.set('search', query);
      } else {
        // Se a caixa de busca foi limpa, remove o parâmetro
        params.delete('search');
      }

      // Ao fazer uma nova busca, sempre voltar para a página 1
      params.set('page', '1');

      // 3. Só atualiza a URL se a busca for realmente diferente
      if (query !== (searchParams.get('search') || '')) {
        router.push(`?${params.toString()}`);
        router.refresh();
      }

    }, 500);

    // Função de limpeza
    return () => {
      clearTimeout(timer);
    };
  }, [query, searchParams, router]);

    return (
        <Input
            placeholder="Pesquise por jovem ou liderança..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
    );
}