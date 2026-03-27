import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { getMockWorklogs, Worklog, submitMockPayment } from '@/client/mockWorklogs'
import { toast } from 'sonner'
import { WorklogsFilters } from '@/components/Worklogs/WorklogsFilters'
import { WorklogsTable } from '@/components/Worklogs/WorklogsTable'
import { PaymentReviewModal } from '@/components/Worklogs/PaymentReviewModal'

export const Route = createFileRoute('/_layout/worklogs/')({
    component: WorklogsContainer,
})

function WorklogsContainer() {
    const [worklogs, setWorklogs] = useState<Worklog[]>([])
    const [loading, setLoading] = useState(true)

    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [excludedEntries, setExcludedEntries] = useState<Set<string>>(new Set())

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    const [expandedFreelancers, setExpandedFreelancers] = useState<Set<string>>(new Set())
    const [expandedWorklogs, setExpandedWorklogs] = useState<Set<string>>(new Set())

    useEffect(() => {
        const fetchWorklogs = async () => {
            setLoading(true)
            try {
                const data = await getMockWorklogs(startDate, endDate)
                setWorklogs(data)
            } catch (error) {
                toast.error('Failed to fetch worklogs')
            } finally {
                setLoading(false)
            }
        }
        fetchWorklogs()
    }, [startDate, endDate])

    useEffect(() => {
        const currentIds = new Set(worklogs.map(w => w.id))
        setSelectedIds(prev => {
            const next = new Set(prev)
            for (const id of next) {
                if (!currentIds.has(id)) next.delete(id)
            }
            return next
        })
    }, [worklogs])

    const toggleSelectAll = () => {
        const elegible = worklogs.filter(w => w.status !== 'PAID')
        if (selectedIds.size === elegible.length && elegible.length > 0) {
            setSelectedIds(new Set())
            setExcludedEntries(new Set())
        } else {
            setSelectedIds(new Set(elegible.map(w => w.id)))
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const excludeFreelancer = (freelancerId: string) => {
        const logsToExclude = worklogs.filter(w => w.freelancer.id === freelancerId).map(w => w.id)
        setSelectedIds(prev => {
            const next = new Set(prev)
            logsToExclude.forEach(id => next.delete(id))
            return next
        })
    }

    const toggleExcludeEntry = (entryId: string) => {
        setExcludedEntries(prev => {
            const next = new Set(prev)
            if (next.has(entryId)) next.delete(entryId)
            else next.add(entryId)
            return next
        })
    }

    const toggleExpandFreelancer = (id: string) => {
        setExpandedFreelancers(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const toggleExpandWorklog = (id: string) => {
        setExpandedWorklogs(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const handleProcessPayment = async () => {
        setIsProcessing(true)
        try {
            const successful = await submitMockPayment(Array.from(selectedIds))
            if (successful) {
                toast.success(`Processed payment for ${selectedIds.size} logged tasks.`)
                setIsPaymentModalOpen(false)
                setSelectedIds(new Set())
                setExcludedEntries(new Set())
                const data = await getMockWorklogs(startDate, endDate)
                setWorklogs(data)
            }
        } catch (error) {
            toast.error('Payment processing failed')
        } finally {
            setIsProcessing(false)
        }
    }

    const selectedWorklogs = useMemo(() => {
        return worklogs.filter(w => selectedIds.has(w.id))
    }, [worklogs, selectedIds])

    const groupedByFreelancer = useMemo(() => {
        type AdjustedWorklog = Worklog & { adjustedEarnings: number; adjustedHours: number; }
        type Group = { freelancerId: string; name: string; email: string; worklogs: AdjustedWorklog[]; total: number }

        const groups = new Map<string, Group>()

        for (const wl of selectedWorklogs) {
            const fid = wl.freelancer.id
            if (!groups.has(fid)) {
                groups.set(fid, {
                    freelancerId: fid,
                    name: wl.freelancer.name,
                    email: wl.freelancer.email,
                    worklogs: [],
                    total: 0
                })
            }

            let adjustedEarnings = 0;
            let adjustedHours = 0;

            for (const entry of wl.entries) {
                if (!excludedEntries.has(entry.id)) {
                    adjustedEarnings += entry.earnings;
                    adjustedHours += entry.hours;
                }
            }

            const g = groups.get(fid)!
            g.worklogs.push({
                ...wl,
                adjustedEarnings,
                adjustedHours
            })
            g.total += adjustedEarnings
        }
        return Array.from(groups.values())
    }, [selectedWorklogs, excludedEntries])

    const totalPaymentAmount = useMemo(() => {
        return groupedByFreelancer.reduce((sum, g) => sum + g.total, 0)
    }, [groupedByFreelancer])

    return (
        <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Worklogs</h1>
                    <p className="text-muted-foreground mt-1">Review freelancer logged time and process payments.</p>
                </div>
                <WorklogsFilters
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                />
            </div>

            <WorklogsTable
                worklogs={worklogs}
                loading={loading}
                selectedIds={selectedIds}
                onToggleSelectAll={toggleSelectAll}
                onToggleSelect={toggleSelect}
                onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            />

            <PaymentReviewModal
                isOpen={isPaymentModalOpen}
                onOpenChange={setIsPaymentModalOpen}
                groupedByFreelancer={groupedByFreelancer}
                totalPaymentAmount={totalPaymentAmount}
                selectedIdsSize={selectedIds.size}
                isProcessing={isProcessing}
                expandedFreelancers={expandedFreelancers}
                expandedWorklogs={expandedWorklogs}
                excludedEntries={excludedEntries}
                onExcludeFreelancer={excludeFreelancer}
                onToggleSelect={toggleSelect}
                onToggleExcludeEntry={toggleExcludeEntry}
                onToggleExpandFreelancer={toggleExpandFreelancer}
                onToggleExpandWorklog={toggleExpandWorklog}
                onHandleProcessPayment={handleProcessPayment}
            />
        </div>
    )
}
