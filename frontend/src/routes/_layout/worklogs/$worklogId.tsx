import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { getMockWorklogById, Worklog, submitMockPayment } from '@/client/mockWorklogs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { ArrowLeft, Clock, Calendar, User, FileText, Banknote, Ban, CheckCircle2, CreditCard } from 'lucide-react'

export const Route = createFileRoute('/_layout/worklogs/$worklogId')({
    component: WorklogDetail,
})

function WorklogDetail() {
    const { worklogId } = Route.useParams()
    const navigate = useNavigate()
    const [worklog, setWorklog] = useState<Worklog | null>(null)
    const [loading, setLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [excludedEntries, setExcludedEntries] = useState<Set<string>>(new Set())

    useEffect(() => {
        const fetchWorklog = async () => {
            setLoading(true)
            try {
                const data = await getMockWorklogById(worklogId)
                if (data) {
                    setWorklog(data)
                } else {
                    toast.error('Worklog not found')
                }
            } catch (error) {
                toast.error('Failed to load worklog details')
            } finally {
                setLoading(false)
            }
        }
        fetchWorklog()
    }, [worklogId])

    const toggleExcludeEntry = (entryId: string) => {
        setExcludedEntries(prev => {
            const next = new Set(prev)
            if (next.has(entryId)) next.delete(entryId)
            else next.add(entryId)
            return next
        })
    }

    const { adjustedEarnings, adjustedHours, isZeroed } = useMemo(() => {
        if (!worklog) return { adjustedEarnings: 0, adjustedHours: 0, isZeroed: true }
        let earnings = 0
        let hours = 0
        for (const entry of worklog.entries) {
            if (!excludedEntries.has(entry.id)) {
                earnings += entry.earnings
                hours += entry.hours
            }
        }
        return {
            adjustedEarnings: earnings,
            adjustedHours: hours,
            isZeroed: earnings === 0 && worklog.entries.length > 0
        }
    }, [worklog, excludedEntries])

    const handleProcessPayment = async () => {
        if (!worklog) return
        setIsProcessing(true)
        try {
            const successful = await submitMockPayment([worklog.id])
            if (successful) {
                toast.success('Successfully processed payment for this worklog.')
                // Redirect back to the index view after processing
                navigate({ to: '/worklogs' })
            }
        } catch (error) {
            toast.error('Payment processing failed')
        } finally {
            setIsProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
                <Button variant="ghost" className="w-fit gap-2 text-muted-foreground" disabled>
                    <ArrowLeft className="h-4 w-4" /> Back to Worklogs
                </Button>
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading specific worklog details...</p>
                </div>
            </div>
        )
    }

    if (!worklog) {
        return (
            <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
                <Button variant="ghost" className="w-fit gap-2" asChild>
                    <Link to="/worklogs">
                        <ArrowLeft className="h-4 w-4" /> Back to Worklogs
                    </Link>
                </Button>
                <div className="flex items-center justify-center h-64">
                    <p className="text-destructive font-semibold">Worklog could not be found.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <Button variant="ghost" className="w-fit gap-2 -ml-3" asChild>
                    <Link to="/worklogs">
                        <ArrowLeft className="h-4 w-4" /> Back to Worklogs
                    </Link>
                </Button>

                {worklog.status !== 'PAID' && (
                    <Button
                        size="lg"
                        onClick={handleProcessPayment}
                        disabled={isZeroed || isProcessing}
                        className="shadow-sm"
                    >
                        {isProcessing ? 'Processing...' : (
                            <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Pay ${adjustedEarnings.toFixed(2)}
                            </>
                        )}
                    </Button>
                )}
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{worklog.taskName}</h1>
                        <Badge variant={worklog.status === 'PAID' ? 'secondary' : worklog.status === 'APPROVED' ? 'default' : 'outline'} className="mt-1">
                            {worklog.status.replace('_', ' ')}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="font-medium text-foreground">{worklog.freelancer.name}</span>
                        <span>({worklog.freelancer.email})</span>
                    </div>
                </div>

                <div className="flex items-center gap-6 bg-secondary/20 p-4 rounded-xl border min-w-[300px] justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">Approved Hours</span>
                        </div>
                        <span className="text-2xl font-bold">{adjustedHours}h <span className="text-sm font-normal text-muted-foreground line-through ml-1">{worklog.totalHours !== adjustedHours ? `${worklog.totalHours}h` : ''}</span></span>
                    </div>
                    <div className="flex flex-col text-right">
                        <div className="flex items-center justify-end gap-2 text-muted-foreground mb-1">
                            <Banknote className="h-4 w-4" />
                            <span className="text-sm font-medium">Authorized Payout</span>
                        </div>
                        <span className="text-2xl font-bold text-primary">
                            ${adjustedEarnings.toFixed(2)}
                            {worklog.totalEarnings !== adjustedEarnings && (
                                <span className="block text-sm font-normal text-muted-foreground line-through">
                                    ${worklog.totalEarnings.toFixed(2)}
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            </div>

            <div className="rounded-md border bg-card shadow-sm mt-4">
                <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            Time Entries
                        </h2>
                        <p className="text-sm text-muted-foreground">Individual tasks and logged hours. Exclude invalid entries dynamically.</p>
                    </div>
                    <Badge variant="outline" className="text-sm px-3 py-1 bg-background">
                        {worklog.entries.length - excludedEntries.size} / {worklog.entries.length} Approved
                    </Badge>
                </div>

                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Rate / Hr</TableHead>
                                <TableHead className="text-right">Hours</TableHead>
                                <TableHead className="text-right">Calculated</TableHead>
                                {worklog.status !== 'PAID' && <TableHead className="text-center w-[120px]">Approval</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {worklog.entries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                                        No time entries found in this worklog.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                worklog.entries.map((entry) => {
                                    const excluded = excludedEntries.has(entry.id)
                                    return (
                                        <TableRow key={entry.id} className={excluded ? 'bg-destructive/5 opacity-60' : ''}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {new Date(entry.date).toLocaleDateString(undefined, {
                                                        year: 'numeric', month: 'short', day: 'numeric'
                                                    })}
                                                </div>
                                            </TableCell>
                                            <TableCell className={excluded ? 'line-clamp-1' : ''}>{entry.description}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">${entry.hourlyRate.toFixed(2)}/h</TableCell>
                                            <TableCell className="text-right font-medium">{entry.hours}h</TableCell>
                                            <TableCell className={`text-right font-semibold ${excluded ? 'line-through text-muted-foreground' : ''}`}>
                                                ${entry.earnings.toFixed(2)}
                                            </TableCell>
                                            {worklog.status !== 'PAID' && (
                                                <TableCell className="text-center p-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`h-8 w-full text-xs gap-1.5 ${excluded ? 'text-primary hover:text-primary hover:bg-primary/10' : 'text-destructive hover:text-destructive hover:bg-destructive/10'}`}
                                                        onClick={() => toggleExcludeEntry(entry.id)}
                                                    >
                                                        {excluded ? <><CheckCircle2 className="h-3.5 w-3.5" /> Include</> : <><Ban className="h-3.5 w-3.5" /> Exclude</>}
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
