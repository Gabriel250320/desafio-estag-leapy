"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TalentPaginationProps {
  totalCount: number;
  currentPage: number;
  perPage?: number;
}

const generatePaginationRange = (total: number, current: number) => {
  const delta = 2; // Quantos números mostrar ao redor da página atual
  const range = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  const rangedWithDots: (number | string)[] = [];
  let l: number | undefined;
  for (const num of range) {
    if (l) {
      if (num - l === 2) {
        rangedWithDots.push(l + 1);
      } else if (num - l !== 1) {
        rangedWithDots.push("...");
      }
    }
    rangedWithDots.push(num);
    l = num;
  }
  return rangedWithDots;
}

export function TalentPagination({
  totalCount,
  currentPage,
  perPage = 10,
}: TalentPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalCount / perPage);

  const paginationRange = useMemo(() => {
    return generatePaginationRange(totalPages, currentPage);
  }, [totalPages, currentPage]);

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
    router.refresh();
  };

  return (
    <Pagination>
      <PaginationContent>

        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={currentPage === 1}
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) {
                handlePageChange(currentPage - 1);
              }
            }}
          />
        </PaginationItem>

        {paginationRange.map((page, index) => {
          if (page === "...") {
            return <PaginationEllipsis key={`dot-${index}`} />;
          }
          return (
            <PaginationItem key={page}>
              <PaginationLink
                href="#" // Usamos o onClick
                isActive={page === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(page as number);
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={currentPage === totalPages}
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) {
                handlePageChange(currentPage + 1);
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}