import {
    BaseRecord,
    CrudFilter,
    CrudSort,
    DataProvider,
    GetListParams,
    GetListResponse,
} from "@refinedev/core";
import { mockSubjects } from "../constants";
import type { Subject } from "@/types";

const matchesFilter = (item: Subject, filter: CrudFilter): boolean => {
    if ("field" in filter) {
        const fieldValue = (item as BaseRecord)[filter.field];

        switch (filter.operator) {
            case "eq":
                return fieldValue === filter.value;
            case "contains":
                return String(fieldValue ?? "")
                    .toLowerCase()
                    .includes(String(filter.value ?? "").toLowerCase());
            default:
                return true;
        }
    }

    if (!Array.isArray(filter.value) || filter.value.length === 0) {
        return true;
    }

    if (filter.operator === "and") {
        return filter.value.every((nestedFilter) =>
            matchesFilter(item, nestedFilter),
        );
    }

    if (filter.operator === "or") {
        return filter.value.some((nestedFilter) =>
            matchesFilter(item, nestedFilter),
        );
    }

    return true;
};

const sortSubjects = (subjects: Subject[], sorters?: CrudSort[]): Subject[] => {
    if (!sorters?.length) {
        return subjects;
    }

    return [...subjects].sort((a, b) => {
        for (const sorter of sorters) {
            const aValue = (a as BaseRecord)[sorter.field];
            const bValue = (b as BaseRecord)[sorter.field];

            if (aValue === bValue) {
                continue;
            }

            const comparison = aValue > bValue ? 1 : -1;
            return sorter.order === "desc" ? -comparison : comparison;
        }

        return 0;
    });
};

export const dataProvider: DataProvider = {
    getList: async <TData extends BaseRecord = BaseRecord>({
        resource,
        pagination,
        filters,
        sorters,
    }: GetListParams): Promise<GetListResponse<TData>> => {
        if(resource != 'subjects') {
            return {data: [] as TData[], total: 0}
        }

        const filteredSubjects = filters?.length
            ? mockSubjects.filter((subject) =>
                  filters.every((filter) => matchesFilter(subject, filter)),
              )
            : mockSubjects;

        const sortedSubjects = sortSubjects(filteredSubjects, sorters);

        const currentPage = pagination?.currentPage ?? 1;
        const pageSize = pagination?.pageSize ?? sortedSubjects.length;
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;

        return {
            data: sortedSubjects.slice(start, end) as unknown as TData[],
            total: sortedSubjects.length,
        }
    },

    getOne: async () => {throw new Error("Method not implemented.")},
    create: async () => {throw new Error("Method not implemented.")},
    update: async () => {throw new Error("Method not implemented.")},
    deleteOne: async () => {throw new Error("Method not implemented.")},
    getApiUrl: () => '',
}
