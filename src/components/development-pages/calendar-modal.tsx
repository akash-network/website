import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import TimeZoneCalendar from './time-zone-calendar'
import { CalendarIcon } from '@heroicons/react/20/solid'

export default function CalendarModal() {
  let [isOpen, setIsOpen] = useState(false)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  return (
    <>
      <button
        id="button"
        className="fixed bottom-6 right-6 flex items-center justify-between rounded-full bg-[#2B2B2B] px-5 py-3 text-xs text-white dark:bg-white dark:text-black md:bottom-9 md:right-9 md:text-sm lg:bottom-12 lg:right-12 lg:text-lg"
        onClick={openModal}
        type="button"
      >
        <CalendarIcon className="mr-1 h-4 w-4" />
        Community Calendar
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[99]" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-screen-2xl transform overflow-hidden rounded-2xl bg-background2 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    <div
                      className="flex items-center justify-between rounded-t"
                    >
                      <h3 className="text-xl font-semibold">
                        Akash Community Groups Calendar
                      </h3>
                      <button
                        type="button"
                        className="ms-auto inline-flex items-center justify-center rounded-lg border bg-transparent px-3 py-2 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:bg-background dark:text-white dark:hover:bg-gray-600 dark:hover:text-gray-800"
                        data-modal-hide="default-modal"
                        onClick={closeModal}
                      >
                        Close
                      </button>
                    </div>
                  </Dialog.Title>
                  <div className="mt-5 flex h-full max-h-[56vh] flex-col gap-4 rounded-lg border bg-background2 p-4">
                    <TimeZoneCalendar
                      calendarId="c_25e5e3748e4c4ab7a55f41fbc5ebebcc0a03b40fb028785f14159bfaebea12e2%40group.calendar.google.com"
                    />
                    <a
                      href="https://calendar.google.com/calendar/u/0?cid=Y18yNWU1ZTM3NDhlNGM0YWI3YTU1ZjQxZmJjNWViZWJjYzBhMDNiNDBmYjAyODc4NWYxNDE1OWJmYWViZWExMmUyQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20"
                      className="not-prose flex items-center justify-center gap-3 rounded-md bg-[#FFDEDE] py-3 text-sm sm:text-base font-medium text-primary dark:bg-background"
                      target="_blank"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.5 3.33366V1.66699M12.5 3.33366V5.00033M12.5 3.33366H8.75M2.5 8.33366V15.8337C2.5 16.7542 3.24619 17.5003 4.16667 17.5003H15.8333C16.7538 17.5003 17.5 16.7542 17.5 15.8337V8.33366H2.5Z"
                          stroke="#FF414C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"></path>
                        <path
                          d="M2.5 8.33301V4.99967C2.5 4.0792 3.24619 3.33301 4.16667 3.33301H5.83333"
                          stroke="#FF414C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"></path>
                        <path
                          d="M5.83594 1.66699V5.00033"
                          stroke="#FF414C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"></path>
                        <path
                          d="M17.4974 8.33301V4.99967C17.4974 4.0792 16.7512 3.33301 15.8307 3.33301H15.4141"
                          stroke="#FF414C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"></path>
                      </svg>
                      Subscribe to SIG & WG calendar
                    </a>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
