// Unified UI Components - Export Index
// مكونات التصميم الموحدة

// Core Components
export { Button } from './Button'
export { Input } from './Input'
export { Textarea } from './Textarea'
export { Select } from './Select'
export { Checkbox } from './Checkbox'
export { RadioGroup } from './RadioGroup'
export { Toggle } from './Toggle'
export { Label } from './Label'
export { DatePicker } from './DatePicker'
export { SearchBar } from './SearchBar'

// Layout Components
export { Grid } from './Grid'
export { PageHeader } from './PageHeader'

// Card Components
export { ActionCard } from './ActionCard'
export { InfoCard } from './InfoCard'

// Data Components
export { DataTable } from './DataTable'
export type { Column, DataTableProps } from './DataTable'

// Navigation Components
export { Breadcrumbs } from './Breadcrumbs'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'

// Feedback Components
export { Notification, ToastContainer } from './Notification'
export { Tooltip } from './Tooltip'
export { Badge } from './Badge'
export { Spinner, Loader, Skeleton, Progress } from './Loader'

// Layout & Structure
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion'
export { Avatar } from './Avatar'
export { EmptyState, NoData, NoResults, ErrorState, LoadingState } from './EmptyState'

// Legacy Components (keeping for backward compatibility)
export { Card, CardContent, CardHeader, CardTitle } from './Card'
export { Modal } from './Modal'
export { FormModal } from './FormModal'
export { ConfirmationDialog } from './ConfirmationDialog'
export { Alert } from './Alert'

// Re-export common types for convenience
export type { ButtonProps } from './Button'
export type { InputProps } from './Input'
export type { SelectProps, SelectOption } from './Select'
export type { CheckboxProps } from './Checkbox'
export type { LabelProps } from './Label'