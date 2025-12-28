/**
 * Utility formatter functions for HireHub
 */

/**
 * Format a number to Indonesian Rupiah currency format
 * @example formatRupiah(7000000) => "Rp7.000.000"
 */
export function formatRupiah(amount: number | string | null | undefined): string {
    if (amount === null || amount === undefined) return '-';
    const num = typeof amount === 'string' ? parseInt(amount.replace(/\D/g, '')) : amount;
    if (isNaN(num)) return '-';
    return `Rp${new Intl.NumberFormat('id-ID').format(num)}`;
}

/**
 * Format a salary range in Rupiah
 * @example formatSalaryRange(7000000, 10000000) => "Rp7.000.000 - Rp10.000.000"
 */
export function formatSalaryRange(min?: number | null, max?: number | null): string {
    if (!min && !max) return '-';
    const minStr = min ? formatRupiah(min) : '';
    const maxStr = max ? formatRupiah(max) : '';
    if (minStr && maxStr) return `${minStr} - ${maxStr}`;
    if (minStr) return `${minStr}+`;
    if (maxStr) return `Up to ${maxStr}`;
    return '-';
}

/**
 * Format a date to Indonesian format
 * @example formatDate("2024-12-28") => "28 Des 2024"
 */
export function formatDate(dateStr: string | Date, locale: string = 'id-ID'): string {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Format a date to full Indonesian format
 * @example formatDateFull("2024-12-28") => "28 Desember 2024"
 */
export function formatDateFull(dateStr: string | Date, locale: string = 'id-ID'): string {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/**
 * Format phone number to Indonesian format
 * @example formatPhone("08123456789") => "+62 812-345-6789"
 */
export function formatPhone(phone: string | null | undefined): string {
    if (!phone) return '-';

    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');

    // Convert local format to international
    let formatted = digits;
    if (digits.startsWith('0')) {
        formatted = '62' + digits.slice(1);
    } else if (!digits.startsWith('62')) {
        formatted = '62' + digits;
    }

    // Format as +62 XXX-XXXX-XXXX
    if (formatted.length >= 10) {
        const country = '+62';
        const rest = formatted.slice(2);

        if (rest.length >= 9) {
            const part1 = rest.slice(0, 3);
            const part2 = rest.slice(3, 7);
            const part3 = rest.slice(7);
            return `${country} ${part1}-${part2}-${part3}`;
        }
        return `${country} ${rest}`;
    }

    return phone;
}

/**
 * Generate a reference ID
 * @example generateReferenceId("APP") => "APP-20241228-ABC123"
 */
export function generateReferenceId(prefix: string = 'REF'): string {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${date}-${random}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text: string): string {
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
