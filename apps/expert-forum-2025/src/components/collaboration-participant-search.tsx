import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown } from 'lucide-react'

import {
  Label,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/react-components/ui'
import { cn } from '@repo/react-components/lib'
import api from 'src/lib/api'
import type { User } from 'src/types/schema'

interface ParticipantSearchSelectorProps {
  selectedParticipantId: string
  onSelectParticipant: (participantId: string) => void
  excludeUserIds?: string[]
  excludeCompany?: string
  label?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyResultMessage?: string
}

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

function ParticipantSearchSelector({
  selectedParticipantId,
  onSelectParticipant,
  excludeUserIds = [],
  excludeCompany,
  label = 'Pilih Participant untuk Diundang *',
  placeholder = 'Pilih participant...',
  searchPlaceholder = 'Cari berdasarkan nama, email, atau company',
  emptyResultMessage = 'Tidak ada participant yang sesuai pencarian',
}: ParticipantSearchSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedParticipant, setSelectedParticipant] = useState<User | null>(null)

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Fetch available participants with server-side search
  const { data: availableParticipants = [], isLoading: isLoadingParticipants } = useQuery<User[]>({
    queryKey: ['availableParticipants', debouncedSearch, excludeCompany],
    queryFn: () => api.groups.getAvailableParticipants(debouncedSearch, excludeCompany),
    enabled: debouncedSearch.length >= 3,
  })

  const handleSelectParticipant = (data: User) => {
    setSelectedParticipant(data.id === selectedParticipantId ? null : data)
    onSelectParticipant(data.id === selectedParticipantId ? '' : data.id)
    setOpen(false)
  }

  // Filter out excluded users from results
  const filteredParticipants = useMemo(() => {
    const excludeSet = new Set(excludeUserIds)
    return availableParticipants.filter(
      (participant) => !excludeSet.has(participant.id)
    )
  }, [availableParticipants, excludeUserIds])

  return (
    <div className="space-y-2 w-full">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedParticipant ? (
              <div className="flex items-center gap-2 truncate">
                <span className="text-sm font-medium truncate">
                  {selectedParticipant.name}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {selectedParticipant.company || 'No company'}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1">
          <Command shouldFilter={false}>
            <CommandInput
              className='w-full'
              placeholder={searchPlaceholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {(debouncedSearch && !isLoadingParticipants) && emptyResultMessage}
                {isLoadingParticipants && 'Memuat...'}
              </CommandEmpty>
              <CommandGroup>
                {filteredParticipants.map((participant) => (
                  <CommandItem
                    key={participant.id}
                    value={participant.id}
                    onSelect={() => { handleSelectParticipant(participant) }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedParticipantId === participant.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-sm font-medium truncate">
                        {participant.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {participant.email} • {participant.company || 'No company'}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default ParticipantSearchSelector
