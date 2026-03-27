import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface WorklogsFiltersProps {
    startDate: string
    endDate: string
    setStartDate: (date: string) => void
    setEndDate: (date: string) => void
}

export function WorklogsFilters({ startDate, endDate, setStartDate, setEndDate }: WorklogsFiltersProps) {
    return (
        <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-lg border">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground ml-1">From:</span>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-auto h-9 bg-background" />
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">To:</span>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-auto h-9 bg-background" />
            </div>
            {(startDate || endDate) && (
                <Button variant="ghost" size="sm" onClick={() => { setStartDate(''); setEndDate(''); }} className="h-9 px-2">Clear</Button>
            )}
        </div>
    )
}
