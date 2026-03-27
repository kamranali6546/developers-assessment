import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FileText, Search, CreditCard, ChevronRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Worklog } from '@/client/mockWorklogs'

interface WorklogsTableProps {
    worklogs: Worklog[]
    loading: boolean
    selectedIds: Set<string>
    onToggleSelectAll: () => void
    onToggleSelect: (id: string) => void
    onOpenPaymentModal: () => void
}

export function WorklogsTable({
    worklogs,
    loading,
    selectedIds,
    onToggleSelectAll,
    onToggleSelect,
    onOpenPaymentModal
}: WorklogsTableProps) {
    const isAllSelected = worklogs.length > 0 &&
        worklogs.filter(w => w.status !== 'PAID').length === selectedIds.size &&
        selectedIds.size > 0

    return (
        <div className="rounded-md border bg-card shadow-sm">
            <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Eligible Worklogs: {worklogs.length}</span>
                </div>
                <Button onClick={onOpenPaymentModal} disabled={selectedIds.size === 0} className="gap-2">
                    <CreditCard className="h-4 w-4" /> Process Payment ({selectedIds.size})
                </Button>
            </div>

            <div className="relative w-full overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={isAllSelected}
                                    onCheckedChange={onToggleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Task</TableHead>
                            <TableHead>Freelancer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Hours</TableHead>
                            <TableHead className="text-right">Earnings</TableHead>
                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-32">Loading worklogs...</TableCell>
                            </TableRow>
                        ) : worklogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">No worklogs found for the selected period.</TableCell>
                            </TableRow>
                        ) : (
                            worklogs.map((worklog) => (
                                <TableRow key={worklog.id} className={selectedIds.has(worklog.id) ? 'bg-primary/5' : ''}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.has(worklog.id)}
                                            onCheckedChange={() => onToggleSelect(worklog.id)}
                                            disabled={worklog.status === 'PAID'}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" /> {worklog.taskName}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{worklog.freelancer.name}</span>
                                            <span className="text-xs text-muted-foreground">{worklog.freelancer.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={worklog.status === 'PAID' ? 'secondary' : worklog.status === 'APPROVED' ? 'default' : 'outline'}>
                                            {worklog.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{worklog.totalHours}h</TableCell>
                                    <TableCell className="text-right font-semibold">${worklog.totalEarnings.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link to="/worklogs/$worklogId" params={{ worklogId: worklog.id }}>
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
