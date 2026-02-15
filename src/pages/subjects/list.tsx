import { CreateButton } from "@/components/refine-ui/buttons/create";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEPARTMENT_OPTIONS } from "@/constants";
import { Subject } from "@/types";
import { useTable } from "@refinedev/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

const SubjectList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const departmentFilter = selectedDepartment === "all" ? [] : [{
        field: "department",
        operator: "eq" as const,
        value: selectedDepartment,
    }];
    const searchFilters = searchQuery ? [
        {field: "name", operator: "contains" as const, value: searchQuery},
    ] : [];

    const columns = useMemo<ColumnDef<Subject>[]>(
        () => [
            {
                id: 'code',
                size: 100,
                accessorKey: "code",
                header: () => <p className="column-title ml-2">Code</p>,
                cell: ({ getValue }) => <Badge>{getValue<string>()}</Badge>,
            },
            {
                id: 'name',
                size: 300,
                accessorKey: "name",
                header: () => <p className="column-title">Name</p>,
                cell: ({ getValue }) => <span className="text-foreground">{getValue<string>()}</span>,
                filterFn: 'includesString'
            },
            {
                id: 'department',
                size: 200,
                accessorKey: "department.name",
                header: () => <p className="column-title">Department</p>,
                cell: ({ getValue }) => <Badge variant="secondary">{getValue<string>()}</Badge>
            },
            {
                id: 'description',
                size: 400,
                accessorKey: "description",
                header: () => <p className="column-title">Description</p>,
                cell: ({ getValue }) => <span className="truncate line-clamp-2">{getValue<string>()}</span>,
            },
        ],[],);

    const subjectTable = useTable<Subject>({
        columns,
        refineCoreProps: {
            resource: 'subjects',
            pagination: {
                pageSize: 10,
                mode: 'server',
            },
            filters: {
                permanent: [...departmentFilter, ...searchFilters],
            },
            sorters: {
                initial: [
                    {field: 'id', order: 'desc'},
                ]
            },
        }
    });

    return (
        <ListView>
            <Breadcrumb />
            <h1 className="page-title">Subjects</h1>
            <div className="intro-row">
                <p>Quick Access to essential metrics and management tools.</p>
                <div className="actions-row">
                    <div className="search-field">
                        <Search className="search-icon"/>
                        <Input 
                            type="text" 
                            placeholder="Search subjects..." 
                            className="pl-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {
                                    DEPARTMENT_OPTIONS.map((dept) => (
                                        <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                        <CreateButton />
                    </div>
                </div>
            </div>

            <DataTable table={subjectTable}></DataTable>
        </ListView>
    )
};

export default SubjectList;
