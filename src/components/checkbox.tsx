import { Checkbox as CheckboxImpl } from "@heroui/react";

interface CheckboxProps extends React.ComponentProps<typeof CheckboxImpl> {
  children?: React.ReactNode;
}

export const Checkbox = ({ children, ...props }: CheckboxProps) => {
  return (
    <CheckboxImpl {...props} >
      <CheckboxImpl.Content className="text-sm font-normal text-neutral-300">
        <CheckboxImpl.Control className="bg-muted/75">
          <CheckboxImpl.Indicator/>
        </CheckboxImpl.Control>
        {children}
      </CheckboxImpl.Content>
    </CheckboxImpl>
  );
};
