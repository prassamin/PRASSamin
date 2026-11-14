"use client";

import React from "react";
import { CodeBlock, type CodeBlockProps } from "@/components/code-block";

export const MdxCodeBlock: React.FC<CodeBlockProps> = (props) => {
  return <CodeBlock {...props} />;
};

export default MdxCodeBlock;
