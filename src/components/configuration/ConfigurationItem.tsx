import React, { useEffect } from "react";
import {
  ConfigurationItemProps,
  PlaceHoldersConfigurationMapping,
  InputConfig,
} from "@/lib/configuration/types";
import { ConfigurationInput } from "@/components/configuration/ConfigurationInputs";
import { useFieldArray } from "react-hook-form";

export const ConfigurationItem = ({
  title,
  description,
  icon,
  addDeleteButton,
  inputConfig,
  registerConf,
  control,
  data,
}: ConfigurationItemProps) => {
  const { inputName, inputValue } = inputConfig || ({} as InputConfig);
  const fieldArrayProps =
    inputValue && control ? { name: inputValue, control } : undefined;

  const { fields, append, remove, update } = fieldArrayProps
    ? useFieldArray(fieldArrayProps)
    : { fields: [] };
  const addItem = () => {
    if (append) {
      append("");
    }
  };
  const removeItem = (index: number) => {
    if (remove) {
      remove(index);
    }
  };
  useEffect(() => {
    if (update) {
      const staffList = data?.staff.split(",");
      staffList?.map((staff, index) => {
        update(index, staff.trim());
      });
    }
  }, [data]);

  return (
    <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md border border-gray-600">
      <div className="w-full flex justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded">{icon}</div>
          <div>
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        {addDeleteButton && (
          <div>
            <button
              type="button"
              className="rounded font-semibold bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow hover:from-orange-500 hover:to-orange-700 transition px-3 py-3"
              onClick={addItem}
            >
              Agregar
            </button>
          </div>
        )}
      </div>
      {(fields.length > 0 ? fields : [{}]).map((field, index) => (
        <div className="w-full mt-3" key={"id" in field ? field.id : index}>
          <div className="w-full flex justify-between">
            <h3 className="text-lg font-bold py-2.5">{inputName}</h3>
            {addDeleteButton && (
              <button onClick={() => removeItem(index)} type="button">
                <img
                  src="/trash-icon.svg"
                  alt="trash icon"
                  className="h-auto w-auto mr-3 py-3"
                />
              </button>
            )}
          </div>
          {inputValue in PlaceHoldersConfigurationMapping && (
            <ConfigurationInput
              label={
                inputValue as keyof typeof PlaceHoldersConfigurationMapping
              }
              register={registerConf!}
              index={index}
            />
          )}
        </div>
      ))}
    </div>
  );
};
