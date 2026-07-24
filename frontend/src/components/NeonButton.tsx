import React from 'react';
import { cn } from '../lib/utils';
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
    "relative group border text-foreground text-center rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none",
    {
        variants: {
            variant: {
                contained: "bg-[#FF5A00] hover:bg-[#E65100] text-white border-transparent hover:border-foreground/50 transition-all duration-200",
                outlined: "border-[#FF5A00] bg-transparent hover:bg-[#FF5A00]/10 text-[#FF5A00]",
                text: "border-transparent bg-transparent hover:bg-[#FF5A00]/10 text-[#FF5A00]",
                // Fallbacks
                solid: "bg-[#FF5A00] hover:bg-[#E65100] text-white border-transparent hover:border-foreground/50 transition-all duration-200",
                ghost: "border-transparent bg-transparent hover:border-zinc-600 hover:bg-[#FF5A00]/10 text-[#FF5A00]",
                default: "bg-[#FF5A00]/5 hover:bg-[#FF5A00]/0 border-[#FF5A00]/20 text-[#FF5A00]",
            },
            size: {
                medium: "px-7 py-1.5",
                small: "px-4 py-0.5 text-sm",
                large: "px-10 py-2.5 text-lg",
                // Fallbacks
                default: "px-7 py-1.5",
                sm: "px-4 py-0.5 text-sm",
                lg: "px-10 py-2.5 text-lg",
            },
            fullWidth: {
                true: "w-full",
                false: "w-fit mx-auto"
            }
        },
        defaultVariants: {
            variant: "contained",
            size: "medium",
            fullWidth: false
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof buttonVariants>, "fullWidth"> {
        neon?: boolean;
        fullWidth?: boolean;
        color?: string; // Ignore MUI color prop and use our brand color mostly
        component?: any; // To prevent errors if passed
        sx?: any; // To prevent errors if passed
        startIcon?: React.ReactNode;
        endIcon?: React.ReactNode;
}

const NeonButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, neon = true, size, variant = "contained", fullWidth = false, children, startIcon, endIcon, color, component = "button", sx, ...props }, ref) => {
        const Component = component;
        return (
            <Component
                className={cn(buttonVariants({ variant: variant as any, size: size as any, fullWidth }), className)}
                ref={ref}
                {...props}
            >
                <span className={cn("absolute h-px opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 inset-y-0 bg-gradient-to-r w-3/4 mx-auto from-transparent via-[#FF5A00] to-transparent hidden", neon && "block")} />
                
                {startIcon && <span className="mr-2">{startIcon}</span>}
                {children}
                {endIcon && <span className="ml-2">{endIcon}</span>}

                <span className={cn("absolute group-hover:opacity-30 transition-all duration-500 ease-in-out inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent via-[#FF5A00] to-transparent hidden", neon && "block")} />
            </Component>
        );
    }
)

NeonButton.displayName = 'NeonButton';

export default NeonButton;
