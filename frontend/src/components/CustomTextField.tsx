import React from "react";
import { cn } from "../lib/utils";
import { Typography } from "@mui/material";

export interface CustomTextFieldProps extends Omit<React.ComponentProps<"input">, "size"> {
  label?: React.ReactNode;
  error?: boolean;
  helperText?: React.ReactNode;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  InputProps?: {
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
    readOnly?: boolean;
    style?: React.CSSProperties;
    [key: string]: any;
  };
  sx?: any;
  variant?: string;
  margin?: string;
  size?: string;
  color?: string;
  InputLabelProps?: any;
  inputProps?: any;
  select?: boolean;
  SelectProps?: any;
}

const CustomTextField = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, CustomTextFieldProps>(
  (
    { 
      className, 
      type, 
      label, 
      error, 
      helperText, 
      fullWidth, 
      multiline, 
      rows = 3, 
      required, 
      InputProps, 
      disabled, 
      id,
      sx,
      variant, // ignored, we use our own style
      margin, // ignored
      size, // ignored
      color, // ignored
      InputLabelProps, // ignored
      inputProps, // MUI prop that conflicts with native DOM elements if passed directly
      select,
      SelectProps,
      children,
      ...props 
    }, 
    ref
  ) => {
    
    const baseClasses = cn(
      "flex w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
      // Orange glow for focus
      "focus-visible:border-[#FF5A00] focus-visible:ring-[#FF5A00]/20",
      // Error styling
      error ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20" : "border-gray-200",
      // Search / File specific
      type === "search" &&
        "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
      type === "file" &&
        "p-0 pr-3 italic text-muted-foreground/70 file:me-3 file:h-full file:border-0 file:border-r file:border-solid file:border-input file:bg-transparent file:px-3 file:text-sm file:font-medium file:not-italic file:text-foreground",
      // Height handling
      !multiline && "h-11", // Standard height for inputs
      className
    );

    const containerClasses = cn(
      "flex flex-col gap-1.5",
      fullWidth ? "w-full" : "w-auto"
    );

    return (
      <div className={containerClasses} style={sx}>
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        
        <div className="relative flex items-center w-full">
          {InputProps?.startAdornment && (
            <div className="absolute left-3 flex items-center text-gray-500 pointer-events-none">
              {InputProps.startAdornment}
            </div>
          )}
          
          {select ? (
            <select
              id={id}
              className={cn(baseClasses, InputProps?.startAdornment && "pl-10", InputProps?.endAdornment && "pr-10")}
              disabled={disabled}
              required={required}
              style={InputProps?.style}
              ref={ref as any}
              {...(inputProps as any)}
              {...(props as any)}
              {...(SelectProps ? (({ native, ...rest }) => rest)(SelectProps) : {})}
            >
              {children}
            </select>
          ) : multiline ? (
            <textarea
              id={id}
              className={cn(baseClasses, InputProps?.startAdornment && "pl-10", InputProps?.endAdornment && "pr-10")}
              rows={rows}
              disabled={disabled}
              required={required}
              readOnly={InputProps?.readOnly}
              style={InputProps?.style}
              ref={ref as any}
              {...(inputProps as any)}
              {...(props as any)}
            />
          ) : (
            <input
              id={id}
              type={type}
              className={cn(baseClasses, InputProps?.startAdornment && "pl-10", InputProps?.endAdornment && "pr-10")}
              disabled={disabled}
              required={required}
              readOnly={InputProps?.readOnly}
              style={InputProps?.style}
              ref={ref as any}
              {...(inputProps as any)}
              {...(props as any)}
            />
          )}

          {InputProps?.endAdornment && (
            <div className="absolute right-3 flex items-center text-gray-500">
              {InputProps.endAdornment}
            </div>
          )}
        </div>

        {helperText && (
          <Typography variant="caption" className={cn("text-xs", error ? "text-red-500" : "text-gray-500")}>
            {helperText}
          </Typography>
        )}
      </div>
    );
  }
);

CustomTextField.displayName = "CustomTextField";

export default CustomTextField;
