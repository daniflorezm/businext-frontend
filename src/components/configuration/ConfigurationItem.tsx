import React from "react";
import {
  ConfigurationItemProps,
  InputConfig,
} from "@/lib/configuration/types";
import { ConfigurationInput } from "@/components/configuration/ConfigurationInputs";

export const ConfigurationItem = ({
  title,
  description,
  icon,
  inputConfig,
  registerConf,
}: ConfigurationItemProps) => {
  const { inputValue } = inputConfig || ({} as InputConfig);

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
        {inputValue && registerConf && (
          <div className="w-full mt-3">
            <ConfigurationInput
              label={inputValue as "businessName"}
              register={registerConf}
            />
          </div>
        )}
      </div>
    </div>
  );
};
