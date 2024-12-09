import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

import { CalendarButton } from "./calendar-button";
import { CalendarIcon } from "@heroicons/react/20/solid";
import TimeZoneCalendar from "./time-zone-calendar";
import { buttonVariants } from "../ui/button";

const CALENDAR_ID =
  "c_25e5e3748e4c4ab7a55f41fbc5ebebcc0a03b40fb028785f14159bfaebea12e2@group.calendar.google.com";
const CALENDAR_URL = `https://calendar.google.com/calendar/u/0?cid=${CALENDAR_ID}`;

export function CalendarModal() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);

  return (
    <>
      <CalendarButton onClick={handleOpenModal} />

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[99]" onClose={handleCloseModal}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-300 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200 ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0  bg-black/50 dark:bg-white/25" />
          </Transition.Child>

          <div className="fixed  inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-4 text-center ">
              <Transition.Child
                as={Fragment}
                enter="transition-transform duration-300 ease-out"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition-transform duration-200 ease-in"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-[90rem] transform overflow-hidden rounded-lg  bg-background px-4 py-3 text-left align-middle shadow-xl transition-all md:px-12 md:py-10 ">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    <div className="flex items-center justify-between rounded-t">
                      <h3 className="font-semibold md:text-2xl">
                        Akash Community <br className="md:hidden" /> Groups
                        Calendar
                      </h3>
                      <button
                        type="button"
                        className={buttonVariants({ variant: "outline" })}
                        onClick={handleCloseModal}
                      >
                        Close
                      </button>
                    </div>
                  </Dialog.Title>
                  <div className="mt-5 flex h-full max-h-[75vh] flex-col gap-4 rounded-md border bg-background2 p-3 md:max-h-[60vh] md:p-5">
                    <TimeZoneCalendar calendarId={CALENDAR_ID} />
                    <a
                      href={CALENDAR_URL}
                      className="not-prose flex items-center justify-center gap-3 rounded-md bg-[#FFDEDE] py-3  text-sm font-medium text-primary dark:bg-background md:text-base"
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
                          stroke-linejoin="round"
                        ></path>
                        <path
                          d="M2.5 8.33301V4.99967C2.5 4.0792 3.24619 3.33301 4.16667 3.33301H5.83333"
                          stroke="#FF414C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                        <path
                          d="M5.83594 1.66699V5.00033"
                          stroke="#FF414C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                        <path
                          d="M17.4974 8.33301V4.99967C17.4974 4.0792 16.7512 3.33301 15.8307 3.33301H15.4141"
                          stroke="#FF414C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
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
  );
}
