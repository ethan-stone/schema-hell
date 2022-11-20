"use client";

import { useMutation } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import type { ReqBody, ResBody } from "../../pages/api/schemas/index";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

type SelectProps<T> = {
  data: T[];
  selected: T;
  mapOptionDisplayName: (option: T) => { id: string; displayName: string };
  onChange: (selected: T) => void;
};

const Select = <T,>(props: SelectProps<T>) => {
  const { data, mapOptionDisplayName, selected, onChange } = props;

  return (
    <Listbox
      value={selected}
      onChange={(selected) => {
        onChange(selected);
      }}
    >
      <div className="relative mt-1">
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
          <span className="block truncate">
            {mapOptionDisplayName(selected).displayName}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {data.map((d) => {
              const { id, displayName } = mapOptionDisplayName(d);
              return (
                <Listbox.Option
                  key={id}
                  value={d}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-amber-100 text-amber-900" : "text-gray-900"
                    }`
                  }
                >
                  {({ selected }) => {
                    return (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {displayName}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    );
                  }}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

const formats = [
  { id: 1, name: "AVRO" },
  { id: 2, name: "JSON" },
  { id: 3, name: "PROTOBUF" },
];

const compatibilities = [
  { id: 1, name: "NONE" },
  { id: 2, name: "DISABLED" },
  { id: 3, name: "BACKWARD" },
  { id: 4, name: "BACKWARD_ALL" },
  { id: 5, name: "FORWARD" },
  { id: 6, name: "FORWARD_ALL" },
  { id: 7, name: "FULL" },
  { id: 8, name: "FULL_ALL" },
];

export default function Editor() {
  const [selectedFormat, setSelectedFormat] = useState<{
    id: number;
    name: string;
  }>(formats[0] as { id: number; name: string });

  const { mutate, isLoading, isSuccess, isError, data } = useMutation({
    mutationFn: async (newSchema: ReqBody) => {
      const res = await fetch("/api/schemas", {
        body: JSON.stringify(newSchema),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      return json as ResBody;
    },
  });
  return (
    <div className="flex flex-grow flex-col items-center justify-center">
      <div className="w-1/3">
        <Select
          data={formats}
          mapOptionDisplayName={({ id, name }) => ({
            id: id.toString(),
            displayName: name,
          })}
          selected={selectedFormat}
          onChange={({ id, name }) => {
            console.log({ id, name });
            setSelectedFormat({ id, name });
          }}
        />
      </div>
    </div>
  );
}
