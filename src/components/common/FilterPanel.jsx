import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { useFilterStore } from '../../store/filterStore'
import clsx from 'clsx'

function MultiSelect({ label, options, selected, onChange, placeholder }) {
  return (
    <Listbox value={selected} onChange={onChange} multiple>
      <div className="relative">
        <Listbox.Label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </Listbox.Label>
        <Listbox.Button className="relative w-full cursor-pointer rounded-2xl glass-input py-2.5 pl-4 pr-10 text-left text-sm focus:outline-none">
          <span className="block truncate text-slate-700">
            {selected.length === 0
              ? placeholder
              : `${selected.length} selected`
            }
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronUpDownIcon className="h-5 w-5 text-slate-400" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl glass py-2 shadow-xl focus:outline-none text-sm">
            {options.slice(0, 100).map((option) => (
              <Listbox.Option
                key={option}
                value={option}
                className={({ active }) =>
                  clsx(
                    'relative cursor-pointer select-none py-2 pl-10 pr-4 transition-colors',
                    active ? 'bg-white/40' : ''
                  )
                }
              >
                {({ selected }) => (
                  <>
                    <span className={clsx('block truncate text-slate-700', selected && 'font-medium')}>
                      {option}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                        <CheckIcon className="h-5 w-5" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}

export default function FilterPanel({ metadata }) {
  const { brands, states, dateRange, setBrands, setStates, setDateRange, clearFilters } = useFilterStore()
  const [isOpen, setIsOpen] = useState(false)

  const hasFilters = brands.length > 0 || states.length > 0 || dateRange.start || dateRange.end

  if (!metadata) return null

  return (
    <div className="mb-6">
      {/* Filter toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300',
          hasFilters
            ? 'glass-button-primary'
            : 'glass-button text-slate-600'
        )}
      >
        <FunnelIcon className="w-4 h-4" />
        Filters
        {hasFilters && (
          <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
            Active
          </span>
        )}
      </button>

      {/* Filter panel */}
      <Transition
        show={isOpen}
        enter="transition-all duration-300"
        enterFrom="opacity-0 -translate-y-4"
        enterTo="opacity-100 translate-y-0"
        leave="transition-all duration-200"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-4"
      >
        <div className="mt-4 p-6 glass-card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* State filter */}
            <MultiSelect
              label="State"
              options={metadata.states || []}
              selected={states}
              onChange={setStates}
              placeholder="All states"
            />

            {/* Brand filter */}
            <MultiSelect
              label="Brand"
              options={metadata.brands || []}
              selected={brands}
              onChange={setBrands}
              placeholder="All brands"
            />

            {/* Date from */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateRange.start || ''}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value || null })}
                className="w-full rounded-2xl glass-input py-2.5 px-4 text-sm text-slate-700 focus:outline-none"
              />
            </div>

            {/* Date to */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateRange.end || ''}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value || null })}
                className="w-full rounded-2xl glass-input py-2.5 px-4 text-sm text-slate-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Clear filters */}
          {hasFilters && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </Transition>
    </div>
  )
}
