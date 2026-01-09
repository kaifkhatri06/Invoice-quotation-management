import { Pipe, PipeTransform } from '@angular/core';

/**
 * Currency Format Pipe
 * Formats numbers as currency with configurable symbol and decimal places
 */
@Pipe({
    name: 'currencyFormat',
    standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
    transform(
        value: number | null | undefined,
        currencySymbol: string = '$',
        decimalPlaces: number = 2
    ): string {
        if (value === null || value === undefined) {
            return `${currencySymbol}0.00`;
        }

        const formatted = value.toFixed(decimalPlaces);
        const parts = formatted.split('.');

        // Add thousand separators
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        return `${currencySymbol}${parts.join('.')}`;
    }
}
