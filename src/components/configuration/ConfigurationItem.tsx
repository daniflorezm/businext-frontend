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
    <div className="w-full max-w-4xl p-6 bg-surface rounded-lg border border-border-subtle">
      <div className="w-full flex justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/15 rounded-lg text-primary">{icon}</div>
          <div>
            <h2 className="font-heading text-h4 font-semibold text-foreground">
              {title}
            </h2>
            <p className="text-body-sm text-foreground-muted">{description}</p>
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
