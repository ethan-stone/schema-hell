"use client";

import { Fragment, useMemo, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { debounce } from "../../utils/debounce";
import { useCreateSchema } from "../../api/create-schema";
import { useCheckSchemaVersionValidity } from "../../api/check-schema-version-validity";
import { useRegisterSchemaVersion } from "../../api/register-schema-version";
import { CMEditor } from "../../components/editor";
import { jsonParseLinter } from "@codemirror/lang-json";

const linter = jsonParseLinter();

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
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-neutral-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-700 sm:text-sm">
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
                    `relative z-10 cursor-default select-none py-2 pl-10 pr-4 ${
                      active
                        ? "bg-neutral-900 text-neutral-100"
                        : "bg-white text-neutral-900"
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
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
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

type Format = "AVRO" | "JSON" | "PROTOBUF";
type Compatability =
  | "NONE"
  | "DISABLED"
  | "BACKWARD_ALL"
  | "BACKWARD"
  | "FORWARD"
  | "FORWARD_ALL"
  | "FULL"
  | "FULL_ALL";

const formats: { id: number; name: Format }[] = [
  { id: 1, name: "AVRO" },
  { id: 2, name: "JSON" },
  { id: 3, name: "PROTOBUF" },
];

const compatibilities: { id: number; name: Compatability }[] = [
  { id: 1, name: "NONE" },
  { id: 2, name: "DISABLED" },
  { id: 3, name: "BACKWARD" },
  { id: 4, name: "BACKWARD_ALL" },
  { id: 5, name: "FORWARD" },
  { id: 6, name: "FORWARD_ALL" },
  { id: 7, name: "FULL" },
  { id: 8, name: "FULL_ALL" },
];

const Spinner = () => (
  <svg
    className="mr-3 h-5 w-5 animate-spin"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default function Editor() {
  const [selectedFormat, setSelectedFormat] = useState<{
    id: number;
    name: Format;
  }>(formats[0] as { id: number; name: Format });
  const [selectedCompatibility, setSelectedCompatibility] = useState<{
    id: number;
    name: Compatability;
  }>(
    compatibilities[0] as {
      id: number;
      name: Compatability;
    }
  );
  const [currentDefinition, setCurrentDefinition] = useState<string>("");
  const [nextDefinition, setNextDefinition] = useState<string>("");
  const [currentSchemaName, setCurrentSchemaName] = useState<string>("");

  const { mutate: createSchema, isLoading: createSchemaIsLoading } =
    useCreateSchema({
      onSuccess: (data) => {
        if (data.ok) {
          setCurrentSchemaName(data.data.name);
        }
      },
    });

  const { mutate: registerSchemaVersion } = useRegisterSchemaVersion();

  const { mutate: checkSchemaVersionValidity } =
    useCheckSchemaVersionValidity();

  const checkSchemaVersionValidityDebounce = useMemo(
    () => debounce(checkSchemaVersionValidity, 500),
    [checkSchemaVersionValidity]
  );

  {
    /* <button
          type="button"
          className="mt-1 w-full rounded-lg bg-neutral-900 p-2 text-neutral-200 shadow-md focus:outline-none"
          onClick={() => {
            createSchema({
              format: selectedFormat.name,
              definition,
              compatibility: selectedCompatibility.name,
            });
          }}
        >
          {createSchemaIsLoading ? (
            <div className="flex flex-row items-center justify-center">
              <Spinner />
              Creating...
            </div>
          ) : (
            "Create Schema"
          )}
        </button>
        <button
          type="button"
          className="mt-1 w-full rounded-lg bg-neutral-900 p-2 text-neutral-200 shadow-md focus:outline-none"
          onClick={() => {
            createSchema({
              format: selectedFormat.name,
              definition,
              compatibility: selectedCompatibility.name,
            });
          }}
        >
          {createSchemaIsLoading ? (
            <div className="flex flex-row items-center justify-center">
              <Spinner />
              Creating...
            </div>
          ) : (
            "New Version"
          )}
        </button> */
  }

  return (
    <div className="flex h-full max-h-screen flex-col items-stretch">
      <div className="h-1/6 w-1/5">
        <Select
          data={formats}
          mapOptionDisplayName={({ id, name }) => ({
            id: id.toString(),
            displayName: name,
          })}
          selected={selectedFormat}
          onChange={({ id, name }) => {
            setSelectedFormat({ id, name });
            checkSchemaVersionValidityDebounce({
              format: name,
              definition: nextDefinition,
            });
          }}
        />
        <Select
          data={compatibilities}
          mapOptionDisplayName={({ id, name }) => ({
            id: id.toString(),
            displayName: name,
          })}
          selected={selectedCompatibility}
          onChange={setSelectedCompatibility}
        />
      </div>
      <div className="flex h-5/6 flex-row">
        <CMEditor
          className="w-5/12"
          doc={currentDefinition}
          onChange={(update) => {
            setCurrentDefinition(update.state.doc.toJSON().join("\n"));
            const diagnostic = linter(update.view);
            console.log(diagnostic);
          }}
        />
        <div className="w-2/12" />
        <CMEditor
          className="w-5/12"
          doc={nextDefinition}
          onChange={(update) => {
            setNextDefinition(update.state.doc.toJSON().join("\n"));
            const diagnostic = linter(update.view);
            console.log(diagnostic);
          }}
        />
      </div>
    </div>
  );
}
