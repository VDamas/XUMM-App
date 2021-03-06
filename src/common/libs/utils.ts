/**
 * Utils
 *
 */
import moment from 'moment';
import { TextEncoder, TextDecoder } from 'text-encoding';

import { NTPService } from '@services';

/* Text Encoding ==================================================================== */
const TextEncoding = {
    //  string to uint8
    /* eslint-disable-next-line */
    toUnit8: (string: string): Uint8Array => new TextEncoder().encode(string),

    // uint8 to string
    /* eslint-disable-next-line */
    toString: (uint8array: Uint8Array): string => new TextDecoder().decode(uint8array),
};

/* Hex Encoding  ==================================================================== */
const HexEncoding = {
    toBinary: (hex: string): Buffer => {
        return hex ? Buffer.from(hex, 'hex') : undefined;
    },

    toString: (hex: string): string | undefined => {
        return hex ? Buffer.from(hex, 'hex').toString('utf-8') : undefined;
    },

    toHex: (text: string): string | undefined => {
        return text ? Buffer.from(text).toString('hex') : undefined;
    },
};

// Truncate text ABC...EFG
const Truncate = (fullString: string, string_length: number): string => {
    if (fullString.length <= string_length) {
        return fullString;
    }

    const separator = '...';

    const separator_length = separator.length;
    const charsToShow = string_length - separator_length;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);

    return fullString.substr(0, frontChars) + separator + fullString.substr(fullString.length - backChars);
};

const NormalizeAmount = (amount: string): string => {
    let sendAmount = amount;

    // filter amount
    sendAmount = sendAmount.replace(',', '.');
    sendAmount = sendAmount.replace(/[^0-9.]/g, '');
    if (sendAmount.split('.').length > 2) {
        sendAmount = sendAmount.replace(/\.+$/, '');
    }

    // not more than 6 decimal places
    if (sendAmount.split('.')[1] && sendAmount.split('.').reverse()[0].length >= 6) {
        sendAmount = `${sendAmount.split('.').reverse()[1]}.${sendAmount
            .split('.')
            .reverse()[0]
            .slice(0, 6)}`;
    }

    // "01" to "1"
    if (sendAmount.length === 2 && sendAmount[0] === '0' && sendAmount[1] !== '.') {
        // eslint-disable-next-line
        sendAmount = sendAmount[1];
    }

    // "." to "0."
    if (sendAmount.length === 1 && sendAmount[0] === '.') {
        // eslint-disable-next-line
        sendAmount = '0.';
    }

    return sendAmount;
};

const NormalizeCurrencyCode = (currencyCode: string): string => {
    // currency code is hex try to decode it
    if (currencyCode.match(/^[A-F0-9]{40}$/)) {
        const decoded = HexEncoding.toString(currencyCode);
        if (decoded.toLowerCase().trim() !== 'xrp') {
            // String
            return decoded;
        }

        return `${currencyCode.slice(0, 4)}...`;
    }
    return currencyCode;
};

const NormalizeDate = (date: string): string => {
    const momentDate = moment(date);
    const reference = moment(NTPService.now());
    const today = reference.clone().startOf('day');
    const yesterday = reference
        .clone()
        .subtract(1, 'days')
        .startOf('day');

    if (momentDate.isSame(today, 'd')) {
        return 'Today';
    }
    if (momentDate.isSame(yesterday, 'd')) {
        return 'Yesterday';
    }

    return momentDate.format('DD MMM');
};

/* Export ==================================================================== */
export { Truncate, NormalizeAmount, NormalizeCurrencyCode, NormalizeDate, TextEncoding, HexEncoding };
