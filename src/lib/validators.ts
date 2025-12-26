import { z } from 'zod';
import { JobFormConfig, AVAILABLE_FORM_FIELDS } from '@/types';

/**
 * Dynamically generates a Zod schema based on job form configuration.
 * Only includes fields that are not hidden, and marks mandatory fields as required.
 */
export function generateApplicationSchema(formConfigs: JobFormConfig[]) {
    const schemaShape: Record<string, z.ZodTypeAny> = {
        // Always required base fields
        applicant_name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
        email: z.string().email('Please enter a valid email address'),
    };

    // Process configured fields
    formConfigs.forEach((config) => {
        if (config.requirement === 'hidden') return;

        const fieldDef = AVAILABLE_FORM_FIELDS.find(f => f.name === config.field_name);
        if (!fieldDef) return;

        let fieldSchema: z.ZodTypeAny;

        switch (fieldDef.type) {
            case 'tel':
                fieldSchema = config.requirement === 'mandatory'
                    ? z.string().min(8, 'Phone number must be at least 8 digits').max(20, 'Phone number is too long')
                        .regex(/^[+]?[\d\s-]+$/, 'Please enter a valid phone number')
                    : z.string().optional().or(z.literal(''));
                break;

            case 'url':
                fieldSchema = config.requirement === 'mandatory'
                    ? z.string().url('Please enter a valid URL').min(1, 'This field is required')
                    : z.string().url('Please enter a valid URL').optional().or(z.literal(''));
                break;

            case 'number':
                fieldSchema = config.requirement === 'mandatory'
                    ? z.coerce.number().min(0, 'Must be a positive number').max(50, 'Value seems too high')
                    : z.coerce.number().min(0).max(50).optional().or(z.literal(''));
                break;

            case 'date':
                fieldSchema = config.requirement === 'mandatory'
                    ? z.string().min(1, 'Please select a date')
                    : z.string().optional();
                break;

            case 'select':
                fieldSchema = config.requirement === 'mandatory'
                    ? z.string().min(1, 'Please select an option')
                    : z.string().optional();
                break;

            case 'textarea':
                fieldSchema = config.requirement === 'mandatory'
                    ? z.string().min(10, 'Please provide more detail (at least 10 characters)')
                    : z.string().optional();
                break;

            case 'camera':
                // Camera field handled separately
                fieldSchema = config.requirement === 'mandatory'
                    ? z.string().min(1, 'Photo is required')
                    : z.string().optional();
                break;

            default:
                fieldSchema = config.requirement === 'mandatory'
                    ? z.string().min(1, 'This field is required')
                    : z.string().optional();
        }

        schemaShape[config.field_name] = fieldSchema;
    });

    return z.object(schemaShape);
}

/**
 * Get validation rules for a specific field
 */
export function getFieldValidation(fieldName: string, requirement: 'mandatory' | 'optional' | 'hidden') {
    return {
        required: requirement === 'mandatory',
        disabled: requirement === 'hidden',
    };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: Record<string, { message?: string }>) {
    const formatted: Record<string, string> = {};
    Object.entries(errors).forEach(([key, value]) => {
        if (value.message) {
            formatted[key] = value.message;
        }
    });
    return formatted;
}

// Export type for the application form data
export type ApplicationFormData = {
    applicant_name: string;
    email: string;
    [key: string]: string | number | undefined;
};
