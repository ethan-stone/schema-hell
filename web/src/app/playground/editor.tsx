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

type SelectProps<T extends { id: number; [k: string]: any }> = {
  className?: string;
  data: T[];
  selected: T;
  mapOptionDisplayName: (option: T) => { id: string; displayName: string };
  onChange: (selected: T) => void;
};

const Select = <T extends { id: number; [k: string]: any }>(
  props: SelectProps<T>
) => {
  const { data, mapOptionDisplayName, selected, onChange, className } = props;

  return (
    <Listbox
      value={selected}
      by="id"
      onChange={(selected) => {
        onChange(selected);
      }}
    >
      <div
        className={className ? `relative mt-1 ${className}` : "relative mt-1"}
      >
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
          <Listbox.Options className="absolute z-50 mt-1 rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {data.map((d) => {
              const { id, displayName } = mapOptionDisplayName(d);
              return (
                <Listbox.Option
                  key={id}
                  value={d}
                  className={({ active }) =>
                    `relative z-50 cursor-default select-none py-2 pl-10 pr-4 ${
                      active
                        ? "bg-neutral-800 text-neutral-100"
                        : "bg-white text-neutral-800"
                    }`
                  }
                >
                  {({ selected }) => {
                    return (
                      <>
                        <span
                          className={`${
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

const formats: { id: number; name: Format }[] = [{ id: 1, name: "JSON" }];

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
  const [currentDefinitionDiagnostic, setCurrentDefinitionDiagnostic] =
    useState<string>();
  const [nextDefinition, setNextDefinition] = useState<string>("");
  const [nextDefinitionDiagnostic, setNextDefinitionDiagnostic] =
    useState<string>();

  // const { mutate: createSchema, isLoading: createSchemaIsLoading } =
  //   useCreateSchema();

  // const { mutate: registerSchemaVersion } = useRegisterSchemaVersion();

  const {
    mutate: checkCurrentSchemaValidity,
    data: checkCurrentSchemaValidityData,
    isLoading: checkCurrentSchemaValidityLoading,
  } = useCheckSchemaVersionValidity();

  const {
    mutate: checkNextSchemaValidity,
    data: checkNextSchemaValidityData,
    isLoading: checkNextSchemaValidityLoading,
  } = useCheckSchemaVersionValidity();

  const checkCurrentSchemaValidityDebounce = useMemo(
    () => debounce(checkCurrentSchemaValidity, 500),
    [checkCurrentSchemaValidity]
  );

  const currentDefinitionIssues = currentDefinitionDiagnostic
    ? currentDefinitionDiagnostic
    : checkCurrentSchemaValidityData?.error
    ? checkCurrentSchemaValidityData.error
    : "No issues found";

  const checkNexyValidityDebounce = useMemo(
    () => debounce(checkNextSchemaValidity, 500),
    [checkNextSchemaValidity]
  );

  const nextDefinitionIssues = nextDefinitionDiagnostic
    ? nextDefinitionDiagnostic
    : checkNextSchemaValidityData?.error
    ? checkNextSchemaValidityData.error
    : "No issues found";

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
      <div className="flex h-[10%] w-1/2 flex-row items-center justify-center gap-4 px-3">
        <span>Schema Format:</span>
        <Select
          className="flex-grow"
          data={formats}
          mapOptionDisplayName={({ id, name }) => ({
            id: id.toString(),
            displayName: name,
          })}
          selected={selectedFormat}
          onChange={({ id, name }) => {
            setSelectedFormat({ id, name });
            checkCurrentSchemaValidityDebounce({
              format: name,
              definition: nextDefinition,
            });
          }}
        />
        <span>Schema Compatability:</span>
        <Select
          className="flex-grow"
          data={compatibilities}
          mapOptionDisplayName={({ id, name }) => ({
            id: id.toString(),
            displayName: name,
          })}
          selected={selectedCompatibility}
          onChange={(d) => {
            setSelectedCompatibility({ id: d.id, name: d.name });
            return;
            4;
          }}
        />
      </div>
      <div className="flex h-[90%] flex-row bg-neutral-800">
        <div className="h-full w-1/2 ">
          <div className="mb-2 h-[8%] p-2 text-white">
            {checkCurrentSchemaValidityLoading ? (
              <Spinner />
            ) : (
              currentDefinitionIssues
            )}
          </div>
          <CMEditor
            className="h-[92%] w-full"
            doc={currentDefinition}
            onChange={(update) => {
              setCurrentDefinition(update.state.doc.toJSON().join("\n"));
              checkCurrentSchemaValidityDebounce({
                definition: update.state.doc.toJSON().join("\n"),
                format: selectedFormat.name,
              });
              const diagnostic = linter(update.view)[0];
              setCurrentDefinitionDiagnostic(diagnostic?.message);
            }}
          />
        </div>
        <div className="h-full w-1/2">
          <div className="mb-2 h-[8%] p-2 text-white">
            {checkNextSchemaValidityLoading ? (
              <Spinner />
            ) : (
              nextDefinitionIssues
            )}
          </div>
          <CMEditor
            className="h-[92%] w-full"
            doc={nextDefinition}
            onChange={(update) => {
              setNextDefinition(update.state.doc.toJSON().join("\n"));
              checkNexyValidityDebounce({
                definition: nextDefinition,
                format: selectedFormat.name,
              });
              const diagnostic = linter(update.view)[0];
              setNextDefinitionDiagnostic(diagnostic?.message);
            }}
          />
        </div>
      </div>
    </div>
  );
}
