"use client";

import React from "react";
import { TemplateDefinitionInfo } from "../types";
import { useBuilderUiStore } from "../store/use-builder-ui-store";

export const useAvailableTemplates = (): TemplateDefinitionInfo[] =>
  useBuilderUiStore((s) => s.availableTemplates);

export const TemplateProvider: React.FC<{
  templates?: TemplateDefinitionInfo[];
  children: React.ReactNode;
}> = ({ children }) => <>{children}</>;
