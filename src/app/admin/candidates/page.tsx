'use client';

import { useEffect, useState, useMemo, useCallback, CSSProperties, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    ColumnDef,
    ColumnFiltersState,
    ColumnOrderState,
    ColumnSizingState,
    RowSelectionState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    Header,
} from '@tanstack/react-table';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppStore } from '@/store';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Search,
    GripVertical,
    Download,
    RotateCcw,
    Trash2,
    Eye,
    CheckSquare,
} from 'lucide-react';
import { Application, ApplicationStatus } from '@/types';

const statusColors: Record<ApplicationStatus, string> = {
    applied: 'bg-blue-500/10 text-blue-500',
    interview: 'bg-yellow-500/10 text-yellow-500',
    hired: 'bg-green-500/10 text-green-500',
    rejected: 'bg-red-500/10 text-red-500',
};

// Storage keys for persistence
const COLUMN_ORDER_KEY = 'hirehub-candidates-column-order';
const COLUMN_SIZING_KEY = 'hirehub-candidates-column-sizing';

// Default column order - now includes 'select' column
const DEFAULT_COLUMN_ORDER = ['select', 'applicant_name', 'email', 'phone', 'job_id', 'status', 'created_at', 'actions'];

// Default column widths
const DEFAULT_COLUMN_SIZING: ColumnSizingState = {
    select: 50,
    applicant_name: 180,
    email: 220,
    phone: 140,
    job_id: 180,
    status: 120,
    created_at: 120,
    actions: 160,
};

// Draggable header component for reordering
function DraggableTableHeader({ header }: { header: Header<Application, unknown> }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: header.column.id,
    });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        width: header.getSize(),
        minWidth: header.getSize(),
    };

    // Don't allow dragging for select column
    const isDraggable = header.column.id !== 'select';

    return (
        <TableHead
            ref={setNodeRef}
            style={style}
            className="whitespace-nowrap select-none group"
        >
            <div className="flex items-center gap-1">
                {/* Drag handle */}
                {isDraggable && (
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity p-1 -ml-1"
                        title="Drag to reorder"
                    >
                        <GripVertical className="h-4 w-4" />
                    </button>
                )}

                {/* Header content */}
                <div className="flex-1">
                    {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                </div>

                {/* Resize handle */}
                {header.column.getCanResize() && (
                    <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-primary/50 transition-colors ${header.column.getIsResizing() ? 'bg-primary' : ''
                            }`}
                        style={{
                            touchAction: 'none',
                        }}
                    />
                )}
            </div>
        </TableHead>
    );
}

// Candidate Detail Modal Component
function CandidateDetailModal({
    application,
    isOpen,
    onClose,
    jobs
}: {
    application: Application | null;
    isOpen: boolean;
    onClose: () => void;
    jobs: { id: string; title: string }[];
}) {
    if (!application) return null;
    const job = jobs.find(j => j.id === application.job_id);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Candidate Details
                    </DialogTitle>
                    <DialogDescription>
                        Application for {job?.title || 'Unknown Job'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Name</label>
                            <p className="text-lg font-semibold">{application.applicant_name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                            <Badge className={`ml-2 ${statusColors[application.status]}`}>
                                {application.status}
                            </Badge>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <p>{application.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Applied Date</label>
                            <p>{new Date(application.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}</p>
                        </div>
                    </div>

                    {/* Form Data */}
                    {application.form_data && Object.keys(application.form_data).length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-3 border-b pb-2">Application Details</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(application.form_data).map(([key, value]) => (
                                    <div key={key}>
                                        <label className="text-sm font-medium text-muted-foreground capitalize">
                                            {key.replace(/_/g, ' ')}
                                        </label>
                                        <p className="break-words">{String(value) || 'N/A'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Photo Preview */}
                    {application.photo_url && (
                        <div>
                            <h4 className="font-semibold mb-3 border-b pb-2">Profile Photo</h4>
                            <img
                                src={application.photo_url}
                                alt={`${application.applicant_name}'s photo`}
                                className="w-32 h-32 object-cover rounded-lg border"
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function CandidatesPageContent() {
    const searchParams = useSearchParams();
    const jobFilter = searchParams.get('job');

    const { applications, jobs, isLoadingApplications, fetchApplications, fetchJobs, updateApplicationStatus, deleteApplication } = useAppStore();

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [globalFilter, setGlobalFilter] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    // Modal state
    const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Column order state with localStorage persistence
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(COLUMN_ORDER_KEY);
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch {
                    return DEFAULT_COLUMN_ORDER;
                }
            }
        }
        return DEFAULT_COLUMN_ORDER;
    });

    // Column sizing state with localStorage persistence
    const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(COLUMN_SIZING_KEY);
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch {
                    return DEFAULT_COLUMN_SIZING;
                }
            }
        }
        return DEFAULT_COLUMN_SIZING;
    });

    // Save column order to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(columnOrder));
        }
    }, [columnOrder]);

    // Save column sizing to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(COLUMN_SIZING_KEY, JSON.stringify(columnSizing));
        }
    }, [columnSizing]);

    useEffect(() => {
        fetchJobs();
        fetchApplications(jobFilter || undefined);
    }, [fetchJobs, fetchApplications, jobFilter]);

    // Reset to default layout
    const resetLayout = useCallback(() => {
        setColumnOrder(DEFAULT_COLUMN_ORDER);
        setColumnSizing(DEFAULT_COLUMN_SIZING);
        localStorage.removeItem(COLUMN_ORDER_KEY);
        localStorage.removeItem(COLUMN_SIZING_KEY);
    }, []);

    // Export to CSV
    const exportToCSV = useCallback(() => {
        const headers = ['Name', 'Email', 'Phone', 'Job', 'Status', 'Applied Date'];
        const rows = applications.map(app => {
            const job = jobs.find(j => j.id === app.job_id);
            const phone = app.form_data?.phone as string || 'N/A';
            return [
                app.applicant_name,
                app.email,
                phone,
                job?.title || 'Unknown',
                app.status,
                new Date(app.created_at).toLocaleDateString(),
            ];
        });

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `candidates-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }, [applications, jobs]);

    // Bulk delete selected applications
    const bulkDelete = useCallback(async () => {
        const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key]);
        const selectedRows = table.getSelectedRowModel().rows;

        if (selectedRows.length === 0) return;

        if (confirm(`Are you sure you want to delete ${selectedRows.length} application(s)?`)) {
            for (const row of selectedRows) {
                await deleteApplication(row.original.id);
            }
            setRowSelection({});
        }
    }, [rowSelection, deleteApplication]);

    // Bulk update status
    const bulkUpdateStatus = useCallback(async (newStatus: ApplicationStatus) => {
        const selectedRows = table.getSelectedRowModel().rows;

        if (selectedRows.length === 0) return;

        for (const row of selectedRows) {
            await updateApplicationStatus(row.original.id, newStatus);
        }
        setRowSelection({});
    }, [updateApplicationStatus]);

    // View candidate details
    const viewCandidateDetails = useCallback((application: Application) => {
        setSelectedCandidate(application);
        setIsDetailModalOpen(true);
    }, []);

    const columns: ColumnDef<Application>[] = useMemo(
        () => [
            // Selection column
            {
                id: 'select',
                header: ({ table }) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                ),
                size: 50,
                enableResizing: false,
                enableSorting: false,
            },
            {
                accessorKey: 'applicant_name',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-4"
                    >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="font-medium">{row.getValue('applicant_name')}</div>
                ),
                size: 180,
                enableResizing: true,
            },
            {
                accessorKey: 'email',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-4"
                    >
                        Email
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                size: 220,
                enableResizing: true,
            },
            {
                accessorKey: 'phone',
                header: 'Phone',
                cell: ({ row }) => {
                    const phone = row.original.form_data?.phone as string;
                    return <span>{phone || 'N/A'}</span>;
                },
                size: 140,
                enableResizing: true,
            },
            {
                accessorKey: 'job_id',
                header: 'Job',
                cell: ({ row }) => {
                    const job = jobs.find((j) => j.id === row.getValue('job_id'));
                    return <span className="truncate">{job?.title || 'Unknown'}</span>;
                },
                size: 180,
                enableResizing: true,
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => {
                    const status = row.getValue('status') as ApplicationStatus;
                    return (
                        <Badge className={`capitalize ${statusColors[status]}`}>
                            {status}
                        </Badge>
                    );
                },
                size: 120,
                enableResizing: true,
            },
            {
                accessorKey: 'created_at',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-4"
                    >
                        Applied
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const date = new Date(row.getValue('created_at'));
                    return <span>{date.toLocaleDateString()}</span>;
                },
                size: 120,
                enableResizing: true,
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => {
                    const application = row.original;
                    return (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => viewCandidateDetails(application)}
                                title="View Details"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Select
                                value={application.status}
                                onValueChange={(value: ApplicationStatus) =>
                                    updateApplicationStatus(application.id, value)
                                }
                            >
                                <SelectTrigger className="w-24 h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="applied">Applied</SelectItem>
                                    <SelectItem value="interview">Interview</SelectItem>
                                    <SelectItem value="hired">Hired</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    );
                },
                size: 160,
                enableResizing: false,
            },
        ],
        [jobs, updateApplicationStatus, viewCandidateDetails]
    );

    const table = useReactTable({
        data: applications,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        onColumnOrderChange: setColumnOrder,
        onColumnSizingChange: setColumnSizing,
        columnResizeMode: 'onChange',
        enableRowSelection: true,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            globalFilter,
            columnOrder,
            columnSizing,
            rowSelection,
            pagination: {
                pageIndex: 0,
                pageSize,
            },
        },
    });

    // DnD sensors for column reordering
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor)
    );

    // Handle column reorder via drag and drop
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setColumnOrder((old) => {
                const oldIndex = old.indexOf(active.id as string);
                const newIndex = old.indexOf(over.id as string);
                return arrayMove(old, oldIndex, newIndex);
            });
        }
    };

    const selectedCount = Object.keys(rowSelection).filter(key => rowSelection[key]).length;

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">Manage Candidates</h1>
                        <p className="text-sm text-muted-foreground">
                            Review and manage job applications
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={resetLayout} title="Reset column layout">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset Layout
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportToCSV} title="Export to CSV">
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Bulk Actions Toolbar - shows when rows are selected */}
                {selectedCount > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <CheckSquare className="h-5 w-5 text-primary" />
                        <span className="font-medium">{selectedCount} selected</span>
                        <div className="flex-1" />
                        <Select onValueChange={(value: ApplicationStatus) => bulkUpdateStatus(value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Set status..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="applied">Set to Applied</SelectItem>
                                <SelectItem value="interview">Set to Interview</SelectItem>
                                <SelectItem value="hired">Set to Hired</SelectItem>
                                <SelectItem value="rejected">Set to Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="destructive" size="sm" onClick={bulkDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Selected
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setRowSelection({})}>
                            Clear Selection
                        </Button>
                    </div>
                )}

                {/* Filters */}
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search candidates..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-10"
                            aria-label="Search candidates by name or email"
                        />
                    </div>
                    {/* Status Filter */}
                    <Select
                        value={
                            (table.getColumn('status')?.getFilterValue() as string) || 'all'
                        }
                        onValueChange={(value) =>
                            table.getColumn('status')?.setFilterValue(value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger className="w-40" aria-label="Filter by status">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="interview">Interview</SelectItem>
                            <SelectItem value="hired">Hired</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* Per Page */}
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => setPageSize(Number(value))}
                    >
                        <SelectTrigger className="w-32" aria-label="Rows per page">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5 per page</SelectItem>
                            <SelectItem value="10">10 per page</SelectItem>
                            <SelectItem value="25">25 per page</SelectItem>
                            <SelectItem value="50">50 per page</SelectItem>
                            <SelectItem value="100">100 per page</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Info bar */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        💡 Drag column headers to reorder • Drag column edges to resize • Click checkbox to select
                    </span>
                </div>

                {/* Table with DnD context for reordering */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="rounded-lg border overflow-x-auto">
                        <Table style={{ width: table.getCenterTotalSize() }}>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        <SortableContext
                                            items={columnOrder}
                                            strategy={horizontalListSortingStrategy}
                                        >
                                            {headerGroup.headers.map((header) => (
                                                <DraggableTableHeader key={header.id} header={header} />
                                            ))}
                                        </SortableContext>
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {isLoadingApplications ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : table.getRowModel().rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            No candidates found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && 'selected'}
                                            className={row.getIsSelected() ? 'bg-primary/5' : ''}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell
                                                    key={cell.id}
                                                    style={{
                                                        width: cell.column.getSize(),
                                                        minWidth: cell.column.getSize(),
                                                    }}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DndContext>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {table.getState().pagination.pageIndex * pageSize + 1} to{' '}
                        {Math.min(
                            (table.getState().pagination.pageIndex + 1) * pageSize,
                            table.getFilteredRowModel().rows.length
                        )}{' '}
                        of {table.getFilteredRowModel().rows.length} results
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Candidate Detail Modal */}
                <CandidateDetailModal
                    application={selectedCandidate}
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    jobs={jobs}
                />
            </div>
        </MainLayout>
    );
}

// Wrapper component with Suspense for useSearchParams
export default function CandidatesPage() {
    return (
        <Suspense fallback={
            <MainLayout>
                <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            </MainLayout>
        }>
            <CandidatesPageContent />
        </Suspense>
    );
}
