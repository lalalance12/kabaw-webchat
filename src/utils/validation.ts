/**
 * Input validation and sanitization utilities
 */

import { VALIDATION_CONFIG } from '../config/constants';

/**
 * Sanitizes username input by trimming, limiting length, and removing dangerous characters
 * @param input - Raw user input
 * @returns Sanitized username string
 */
export function sanitizeUsername(input: string): string {
    return input
        .trim()
        .slice(0, VALIDATION_CONFIG.MAX_USERNAME_LENGTH)
        .replace(VALIDATION_CONFIG.DANGEROUS_CHARS_PATTERN, '');
}

/**
 * Sanitizes channel name input
 * @param input - Raw channel input
 * @returns Sanitized channel name
 */
export function sanitizeChannel(input: string): string {
    return input
        .trim()
        .toLowerCase()
        .slice(0, VALIDATION_CONFIG.MAX_CHANNEL_LENGTH)
        .replace(VALIDATION_CONFIG.DANGEROUS_CHARS_PATTERN, '')
        .replace(/\s+/g, '-'); // Replace spaces with dashes for URL-friendliness
}

/**
 * Validates username format
 * @param username - Username to validate
 * @returns Object with isValid boolean and optional error message
 */
export function validateUsername(username: string): { isValid: boolean; error?: string } {
    const trimmed = username.trim();

    if (trimmed.length === 0) {
        return { isValid: true }; // Empty is okay, will use "Anonymous"
    }

    if (trimmed.length > VALIDATION_CONFIG.MAX_USERNAME_LENGTH) {
        return {
            isValid: false,
            error: `Username must be ${VALIDATION_CONFIG.MAX_USERNAME_LENGTH} characters or less`
        };
    }

    if (!VALIDATION_CONFIG.ALLOWED_CHARS_PATTERN.test(trimmed)) {
        return {
            isValid: false,
            error: 'Username can only contain letters, numbers, spaces, underscores, and dashes'
        };
    }

    return { isValid: true };
}

/**
 * Validates channel name format
 * @param channel - Channel name to validate
 * @returns Object with isValid boolean and optional error message
 */
export function validateChannel(channel: string): { isValid: boolean; error?: string } {
    const trimmed = channel.trim();

    if (trimmed.length === 0) {
        return { isValid: true }; // Empty is okay, will use "general"
    }

    if (trimmed.length > VALIDATION_CONFIG.MAX_CHANNEL_LENGTH) {
        return {
            isValid: false,
            error: `Channel name must be ${VALIDATION_CONFIG.MAX_CHANNEL_LENGTH} characters or less`
        };
    }

    if (!VALIDATION_CONFIG.ALLOWED_CHARS_PATTERN.test(trimmed)) {
        return {
            isValid: false,
            error: 'Channel name can only contain letters, numbers, spaces, underscores, and dashes'
        };
    }

    return { isValid: true };
}

/**
 * Sanitizes message content before sending
 * @param content - Raw message content
 * @returns Sanitized message string
 */
export function sanitizeMessage(content: string): string {
    return content.trim();
}
