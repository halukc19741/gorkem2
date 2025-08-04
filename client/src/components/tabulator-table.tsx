import { useEffect, useRef } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import type { GuaranteeLetterWithRelations } from "@shared/schema";
import { useCurrency } from "@/hooks/use-currency";
import "tabulator-tables/dist/css/tabulator.min.css";

interface TabulatorTableProps {
  data: GuaranteeLetterWithRelations[];
  selectedProjects: string[];
  selectedBanks: string[];
}

export default function TabulatorTable({ data, selectedProjects, selectedBanks }: TabulatorTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorRef = useRef<Tabulator | null>(null);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    if (!tableRef.current) return;

    // Filter data based on selected projects and banks
    let filteredData = data;
    if (selectedProjects.length > 0) {
      filteredData = filteredData.filter(item => 
        selectedProjects.includes(item.projectId)
      );
    }
    if (selectedBanks.length > 0) {
      filteredData = filteredData.filter(item => 
        selectedBanks.includes(item.bankId)
      );
    }

    const columns = [
      {
        title: "Banka",
        field: "bank.name",
        width: 150,
        frozen: true,
      },
      {
        title: "Proje",
        field: "project.name",
        width: 150,
      },
      {
        title: "Mektup Türü",
        field: "letterType",
        width: 130,
        formatter: (cell: any) => {
          const value = cell.getValue();
          const typeMap: { [key: string]: string } = {
            'teminat': 'Teminat',
            'avans': 'Avans Teminat',
            'kesin-teminat': 'Kesin Teminat',
            'gecici-teminat': 'Geçici Teminat'
          };
          return typeMap[value] || value;
        }
      },
      {
        title: "Sözleşme Tutarı",
        field: "contractAmount",
        width: 130,
        formatter: (cell: any) => {
          const value = parseFloat(cell.getValue() || '0');
          const currency = cell.getRow().getData().currency;
          return formatCurrency(value, currency);
        }
      },
      {
        title: "Mektup %",
        field: "letterPercentage",
        width: 80,
        formatter: (cell: any) => `%${parseFloat(cell.getValue() || '0').toFixed(2)}`
      },
      {
        title: "Mektup Tutarı",
        field: "letterAmount",
        width: 130,
        formatter: (cell: any) => {
          const value = parseFloat(cell.getValue() || '0');
          const currency = cell.getRow().getData().currency;
          return formatCurrency(value, currency);
        }
      },
      {
        title: "Komisyon %",
        field: "commissionRate",
        width: 100,
        formatter: (cell: any) => `%${parseFloat(cell.getValue() || '0').toFixed(2)}`
      },
      {
        title: "Para Birimi",
        field: "currency",
        width: 80,
      },
      {
        title: "Alım Tarihi",
        field: "purchaseDate",
        width: 110,
        formatter: (cell: any) => {
          const date = new Date(cell.getValue());
          return date.toLocaleDateString('tr-TR');
        }
      },
      {
        title: "Mektup Tarihi",
        field: "letterDate",
        width: 110,
        formatter: (cell: any) => {
          const date = new Date(cell.getValue());
          return date.toLocaleDateString('tr-TR');
        }
      },
      {
        title: "Son Tarih",
        field: "expiryDate",
        width: 110,
        formatter: (cell: any) => {
          const value = cell.getValue();
          if (!value) return '-';
          const date = new Date(value);
          return date.toLocaleDateString('tr-TR');
        }
      },
      {
        title: "Durum",
        field: "status",
        width: 100,
        formatter: (cell: any) => {
          const value = cell.getValue();
          const statusMap: { [key: string]: { text: string, class: string } } = {
            'aktif': { text: 'Aktif', class: 'bg-green-100 text-green-800' },
            'beklemede': { text: 'Beklemede', class: 'bg-yellow-100 text-yellow-800' },
            'kapali': { text: 'Kapalı', class: 'bg-gray-100 text-gray-800' },
            'iptal': { text: 'İptal', class: 'bg-red-100 text-red-800' }
          };
          const status = statusMap[value] || { text: value, class: 'bg-gray-100 text-gray-800' };
          return `<span class="px-2 py-1 rounded-full text-xs font-medium ${status.class}">${status.text}</span>`;
        }
      },
      {
        title: "Notlar",
        field: "notes",
        width: 200,
        formatter: (cell: any) => {
          const value = cell.getValue();
          return value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : '-';
        }
      }
    ];

    if (tabulatorRef.current) {
      tabulatorRef.current.destroy();
    }

    tabulatorRef.current = new Tabulator(tableRef.current, {
      data: filteredData,
      columns: columns,
      layout: "fitDataStretch",
      responsiveLayout: "hide",
      pagination: "local",
      paginationSize: 25,
      paginationSizeSelector: [10, 25, 50, 100],
      movableColumns: true,
      resizableRows: true,
      tooltips: true,
      printAsHtml: true,
      printStyled: true,
      downloadConfig: {
        columnGroups: false,
        rowGroups: false,
        columnCalcs: false
      },
      downloadRowRange: "all",
      langs: {
        "tr": {
          "pagination": {
            "first": "İlk",
            "first_title": "İlk Sayfa",
            "last": "Son",
            "last_title": "Son Sayfa",
            "prev": "Önceki",
            "prev_title": "Önceki Sayfa",
            "next": "Sonraki",
            "next_title": "Sonraki Sayfa"
          }
        }
      },
      locale: "tr",
      height: "500px",
    });

    return () => {
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy();
        tabulatorRef.current = null;
      }
    };
  }, [data, selectedProjects, selectedBanks, formatCurrency]);

  return (
    <div className="w-full">
      <div ref={tableRef} className="tabulator-table"></div>
    </div>
  );
}
