import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { clsx } from 'clsx'

import { getDevices } from "~/models/device.server"

import { Text } from "~/components/catalyst/text"

export const loader = async () => {
  // const userId = "2258aded-43b7-474c-b1a4-93ca9a478bee"
  const projectId = "69b1f8a1-8e0b-4900-99f3-50ac4321032a"

  const devices = await getDevices({ projectId })
  return json({ devices })
}

export default function Devices() {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <h1 className="text-base font-semibold leading-7 text-white">Devices</h1>
        <Text>Add Device</Text>
      </header>

      <ul className="divide-y divide-white/5">
        {data.devices.map((device) => (
          <li key={device.id} className="relative flex items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="min-w-0 flex-auto">
              <div className="flex items-center gap-x-3">
                <div className='flex-none rounded-full p-1'>
                  <div className="h-2 w-2 rounded-full bg-current" />
                </div>
                <h2 className="min-w-0 text-sm font-semibold leading-6 text-white">
                  <a href="#" className="flex gap-x-2">
                    <span className="truncate">{device.shortCode}</span>
                    <span className="text-gray-400">/</span>
                    <span className="whitespace-nowrap">{device.description}</span>
                    <span className="absolute inset-0" />
                  </a>
                </h2>
              </div>
              <div className="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
                <p className="truncate">{device.vendor}</p>
                <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 flex-none fill-gray-300">
                  <circle cx={1} cy={1} r={1} />
                </svg>
                <p className="whitespace-nowrap">{device.model}</p>
              </div>
            </div>
            <div
              className={clsx('rounded-full flex-none py-1 px-2 text-xs font-medium ring-1 ring-inset'
              )}
            >
              {device.notes}
            </div>
            <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </>
  )
};
