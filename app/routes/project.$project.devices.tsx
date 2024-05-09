import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useState } from 'react'
import { useLoaderData } from "@remix-run/react";
import { clsx } from 'clsx'
import { Bars3Icon, ChevronRightIcon, ChevronUpDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'

import { getDevices } from "~/models/device.server"

import Navbar from "~/components/navbar"
import SearchBar from "~/components/search"
import { Text } from "~/components/catalyst/text"

export const loader = async () => {
  // const userId = "2258aded-43b7-474c-b1a4-93ca9a478bee"
  const projectId = "69b1f8a1-8e0b-4900-99f3-50ac4321032a"

  const devices = await getDevices({ projectId })
  return json({ devices })
}

export const meta: MetaFunction = () => {
  return [
    { title: "Puff of Smoke" },
    { name: "description", content: "Wire management for experimental planes" },
  ];
};

const statuses = {
  offline: 'text-gray-500 bg-gray-100/10',
  online: 'text-green-400 bg-green-400/10',
  error: 'text-rose-400 bg-rose-400/10',
}
const environments = {
  Preview: 'text-gray-400 bg-gray-400/10 ring-gray-400/20',
  Production: 'text-indigo-400 bg-indigo-400/10 ring-indigo-400/30',
}
const deployments = [
  {
    id: 1,
    href: '#',
    projectName: 'ios-app',
    teamName: 'Planetaria',
    status: 'offline',
    statusText: 'Initiated 1m 32s ago',
    description: 'Deploys from GitHub',
    environment: 'Preview',
  },
  // More deployments...
]
const activityItems = [
  {
    user: {
      name: 'Michael Foster',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    projectName: 'ios-app',
    commit: '2d89f0c8',
    branch: 'main',
    date: '1h',
    dateTime: '2023-01-23T11:00',
  },
  // More items...
]


export default function Devices() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const data = useLoaderData<typeof loader>()

  return (
    <>
      <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <h1 className="text-base font-semibold leading-7 text-white">Devices</h1>
        <Text>Add Device</Text>

      </header>

      {/* Deployment list */}
      <ul role="list" className="divide-y divide-white/5">
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
