
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '../layout/AppProvider';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onValueChange: (value: number) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, className, ...props }, ref) => {
    const { currency } = useApp();
    const isIDR = currency === 'IDR';
    const locale = isIDR ? 'id-ID' : 'en-US';
    const formatter = React.useMemo(() => new Intl.NumberFormat(locale, {
        minimumFractionDigits: isIDR ? 0 : 2,
        maximumFractionDigits: isIDR ? 0 : 2,
    }), [locale, isIDR]);

    const [displayValue, setDisplayValue] = React.useState(() => value ? formatter.format(value) : '');

    React.useEffect(() => {
        setDisplayValue(value ? formatter.format(value) : '');
    }, [value, formatter]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const thousandsSeparator = isIDR ? '.' : ',';
        const decimalSeparator = isIDR ? ',' : '.';

        // Remove all thousand separators
        const cleanedValue = rawValue.replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '');
        
        // Replace decimal separator with a dot for parsing
        const parsableValue = cleanedValue.replace(decimalSeparator, '.');

        // Allow only numbers and one decimal point
        if (/^\d*\.?\d*$/.test(parsableValue)) {
            const numericValue = parseFloat(parsableValue);
            if (!isNaN(numericValue)) {
                onValueChange(numericValue);
                setDisplayValue(rawValue); // Show user's typing
            } else if (parsableValue === '' || parsableValue === '.') {
                onValueChange(0);
                setDisplayValue(rawValue);
            }
        }
    };
    
    const handleBlur = () => {
        setDisplayValue(value ? formatter.format(value) : '');
    }

    return (
      <input
        {...props}
        ref={ref}
        type="text"
        inputMode={isIDR ? 'numeric' : 'decimal'}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
