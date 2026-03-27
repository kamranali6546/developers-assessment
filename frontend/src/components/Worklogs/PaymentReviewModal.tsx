import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronDown, ChevronUp, ChevronRight, UserMinus, Trash2, Calendar, Clock, DollarSign, Ban, CheckCircle2, CreditCard, FileText } from 'lucide-react'
import { Worklog } from '@/client/mockWorklogs'

type AdjustedWorklog = Worklog & { adjustedEarnings: number; adjustedHours: number; }
type Group = { freelancerId: string; name: string; email: string; worklogs: AdjustedWorklog[]; total: number }

interface PaymentReviewModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    groupedByFreelancer: Group[]
    totalPaymentAmount: number
    selectedIdsSize: number
    isProcessing: boolean
    expandedFreelancers: Set<string>
    expandedWorklogs: Set<string>
    excludedEntries: Set<string>
    onExcludeFreelancer: (id: string) => void
    onToggleSelect: (id: string) => void
    onToggleExcludeEntry: (id: string) => void
    onToggleExpandFreelancer: (id: string) => void
    onToggleExpandWorklog: (id: string) => void
    onHandleProcessPayment: () => void
}

export function PaymentReviewModal({
    isOpen,
    onOpenChange,
    groupedByFreelancer,
    totalPaymentAmount,
    selectedIdsSize,
    isProcessing,
    expandedFreelancers,
    expandedWorklogs,
    excludedEntries,
    onExcludeFreelancer,
    onToggleSelect,
    onToggleExcludeEntry,
    onToggleExpandFreelancer,
    onToggleExpandWorklog,
    onHandleProcessPayment
}: PaymentReviewModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-[800px] max-h-[95vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b bg-muted/20">
                    <DialogTitle className="text-2xl">Review Payment Batch</DialogTitle>
                    <DialogDescription className="mt-2 text-base">
                        Review detailed time entries before finalizing the transfer of funds.
                        Exclude an entire freelancer payload, specific worklogs, or even individual logged hours dynamically.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto bg-muted/10 p-6">
                    {groupedByFreelancer.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                            <CreditCard className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-lg">No worklogs selected</p>
                            <p className="text-sm">All payments excluded from this batch.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {groupedByFreelancer.map((group) => {
                                const expanded = expandedFreelancers.has(group.freelancerId)
                                return (
                                    <div key={group.freelancerId} className="border bg-card rounded-lg shadow-sm overflow-hidden">
                                        <div className="flex items-center justify-between p-4 border-b hover:bg-muted/30 transition-colors">
                                            <div
                                                className="flex items-center gap-3 cursor-pointer select-none flex-1"
                                                onClick={() => onToggleExpandFreelancer(group.freelancerId)}
                                            >
                                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                                                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">{group.name}</h3>
                                                    <p className="text-xs text-muted-foreground -mt-0.5">{group.email} • {group.worklogs.length} worklogs</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Approved Subtotal</p>
                                                    <p className="font-bold text-lg text-primary">${group.total.toFixed(2)}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 -mr-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onExcludeFreelancer(group.freelancerId);
                                                    }}
                                                >
                                                    <UserMinus className="h-4 w-4 mr-2" />
                                                    Exclude Member
                                                </Button>
                                            </div>
                                        </div>

                                        {expanded && (
                                            <div className="bg-muted/5 divide-y divide-border/50">
                                                {group.worklogs.map(wl => {
                                                    const wlExpanded = expandedWorklogs.has(wl.id)
                                                    const isZeroed = wl.adjustedEarnings === 0 && wl.entries.length > 0;

                                                    return (
                                                        <div key={wl.id} className="flex flex-col">
                                                            <div className={`flex items-center justify-between p-3 pl-6 pr-6 hover:bg-muted/20 ${isZeroed ? 'opacity-50 grayscale' : ''}`}>
                                                                <div
                                                                    className="flex items-center gap-2 cursor-pointer flex-1 user-select-none"
                                                                    onClick={() => onToggleExpandWorklog(wl.id)}
                                                                >
                                                                    {wlExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground mr-1" /> : <ChevronRight className="h-4 w-4 text-muted-foreground mr-1" />}
                                                                    <FileText className="h-4 w-4 text-primary" />
                                                                    <span className="font-medium">{wl.taskName}</span>
                                                                    <Badge variant="outline" className="ml-2 text-[10px] h-5">{wl.entries.length} Entries</Badge>
                                                                </div>
                                                                <div className="flex items-center gap-6">
                                                                    <div className="text-right">
                                                                        <span className="text-xs text-muted-foreground mr-2">{wl.adjustedHours}h Approved</span>
                                                                        <span className={`font-semibold ${isZeroed ? 'line-through text-muted-foreground' : ''}`}>${wl.adjustedEarnings.toFixed(2)}</span>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                                        title="Exclude Worklog entirely"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onToggleSelect(wl.id);
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            {wlExpanded && wl.entries.length > 0 && (
                                                                <div className="pl-6 pr-6 py-3 bg-secondary/20 shadow-inner">
                                                                    <div className="border border-border/60 rounded-md overflow-hidden bg-background">
                                                                        <Table>
                                                                            <TableHeader className="bg-muted/30">
                                                                                <TableRow>
                                                                                    <TableHead className="w-[110px] h-8 text-xs"><div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Date</div></TableHead>
                                                                                    <TableHead className="h-8 text-xs">Description</TableHead>
                                                                                    <TableHead className="text-right h-8 text-xs">Rate</TableHead>
                                                                                    <TableHead className="text-right h-8 text-xs"><div className="flex items-center justify-end gap-1.5"><Clock className="h-3 w-3" /> Hrs</div></TableHead>
                                                                                    <TableHead className="text-right h-8 text-xs"><div className="flex items-center justify-end gap-1.5"><DollarSign className="h-3 w-3" /> Total</div></TableHead>
                                                                                    <TableHead className="text-center w-[120px] h-8 text-xs">Approval</TableHead>
                                                                                </TableRow>
                                                                            </TableHeader>
                                                                            <TableBody>
                                                                                {wl.entries.map((entry) => {
                                                                                    const excluded = excludedEntries.has(entry.id);
                                                                                    return (
                                                                                        <TableRow key={entry.id} className={excluded ? 'bg-destructive/5 opacity-60' : ''}>
                                                                                            <TableCell className="text-xs">{entry.date}</TableCell>
                                                                                            <TableCell className="text-xs text-muted-foreground line-clamp-1">{entry.description}</TableCell>
                                                                                            <TableCell className="text-xs text-right">${entry.hourlyRate}</TableCell>
                                                                                            <TableCell className="text-xs font-medium text-right">{entry.hours}</TableCell>
                                                                                            <TableCell className={`text-xs font-semibold text-right ${excluded ? 'line-through' : ''}`}>
                                                                                                ${entry.earnings.toFixed(2)}
                                                                                            </TableCell>
                                                                                            <TableCell className="text-center p-1">
                                                                                                <Button
                                                                                                    variant="ghost"
                                                                                                    size="sm"
                                                                                                    className={`h-7 w-full text-xs gap-1 ${excluded ? 'text-primary hover:text-primary hover:bg-primary/10' : 'text-destructive hover:text-destructive hover:bg-destructive/10'}`}
                                                                                                    onClick={() => onToggleExcludeEntry(entry.id)}
                                                                                                >
                                                                                                    {excluded ? <><CheckCircle2 className="h-3 w-3" /> Include</> : <><Ban className="h-3 w-3" /> Exclude</>}
                                                                                                </Button>
                                                                                            </TableCell>
                                                                                        </TableRow>
                                                                                    );
                                                                                })}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter className="bg-background border-t p-6 flex flex-row items-center justify-between sm:justify-between shadow-[0_-4px_10px_-10px_rgba(0,0,0,0.1)] z-10">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Authorized Payout</span>
                        <span className="text-3xl font-extrabold tracking-tight">${totalPaymentAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" size="lg" onClick={() => onOpenChange(false)}>Cancel Processing</Button>
                        <Button
                            size="lg"
                            onClick={onHandleProcessPayment}
                            disabled={selectedIdsSize === 0 || totalPaymentAmount === 0 || isProcessing}
                            className="min-w-[160px] shadow-md"
                        >
                            {isProcessing ? 'Authorizing...' : 'Authorize Payment'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
