export interface Freelancer {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface TimeEntry {
  id: string
  date: string // ISO date format YYYY-MM-DD
  hours: number
  description: string
  hourlyRate: number
  earnings: number
}

export interface Worklog {
  id: string
  taskName: string
  freelancer: Freelancer
  status: 'PENDING_REVIEW' | 'APPROVED' | 'PAID'
  entries: TimeEntry[]
  totalEarnings: number
  totalHours: number
}

// Mock Database
const MOCK_FREELANCERS: Freelancer[] = [
  { id: 'f1', name: 'Alice Parker', email: 'alice@example.com' },
  { id: 'f2', name: 'Bob Smith', email: 'bob@example.com' },
  { id: 'f3', name: 'Charlie Davis', email: 'charlie@example.com' },
]

export const MOCK_WORKLOGS: Worklog[] = [
  {
    id: 'wl_001',
    taskName: 'Frontend Assessment Implementation',
    freelancer: MOCK_FREELANCERS[0],
    status: 'PENDING_REVIEW',
    entries: [
      { id: 'te_1', date: '2026-03-24', hours: 4, description: 'Project setup and routing', hourlyRate: 40, earnings: 160 },
      { id: 'te_2', date: '2026-03-25', hours: 3.5, description: 'Mock data and tables', hourlyRate: 40, earnings: 140 },
    ],
    totalEarnings: 300,
    totalHours: 7.5,
  },
  {
    id: 'wl_002',
    taskName: 'UI Design for Dashboard',
    freelancer: MOCK_FREELANCERS[1],
    status: 'APPROVED',
    entries: [
      { id: 'te_3', date: '2026-03-20', hours: 5, description: 'Wireframing', hourlyRate: 50, earnings: 250 },
      { id: 'te_4', date: '2026-03-22', hours: 6, description: 'High-fidelity mockups', hourlyRate: 50, earnings: 300 },
    ],
    totalEarnings: 550,
    totalHours: 11,
  },
  {
    id: 'wl_003',
    taskName: 'Backend API Integration',
    freelancer: MOCK_FREELANCERS[2],
    status: 'PAID',
    entries: [
      { id: 'te_5', date: '2026-03-15', hours: 8, description: 'Payment gateway integration', hourlyRate: 45, earnings: 360 },
      { id: 'te_6', date: '2026-03-16', hours: 4, description: 'Testing & fixing bugs', hourlyRate: 45, earnings: 180 },
    ],
    totalEarnings: 540,
    totalHours: 12,
  },
  {
    id: 'wl_004',
    taskName: 'Landing Page Animations',
    freelancer: MOCK_FREELANCERS[0],
    status: 'PENDING_REVIEW',
    entries: [
      { id: 'te_7', date: '2026-03-26', hours: 5, description: 'Framer motion implementation', hourlyRate: 40, earnings: 200 },
    ],
    totalEarnings: 200,
    totalHours: 5,
  },
]

// Mock Service Functions
export async function getMockWorklogs(startDate?: string, endDate?: string): Promise<Worklog[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return MOCK_WORKLOGS.filter((wl) => {
    // If no date range filter, include all
    if (!startDate && !endDate) return true

    // Check if ANY entry in the worklog falls within the date range
    return wl.entries.some((entry) => {
      const entryDate = new Date(entry.date)
      const start = startDate ? new Date(startDate) : new Date('1970-01-01')
      const end = endDate ? new Date(endDate) : new Date('2099-12-31')
      
      // Reset times to 00:00:00 for accurate day comparison
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      
      return entryDate >= start && entryDate <= end
    })
  })
}

export async function getMockWorklogById(id: string): Promise<Worklog | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return MOCK_WORKLOGS.find((wl) => wl.id === id) || null
}

export async function submitMockPayment(worklogIds: string[]): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log('Processing payment for worklogs:', worklogIds)
  // In a real app we would send this to the backend
  return true
}
