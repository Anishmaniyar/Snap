import { randomInt } from "crypto";
const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const CODE_LENGTH = 6;
const MAX_CODE = 62 ** CODE_LENGTH;
// Random number → Base62 encoding. Fixed 6-char codes, ~57B combinations.
export const generateShortCode = () => {
    let num = randomInt(MAX_CODE);
    let code = "";
    for (let i = 0; i < CODE_LENGTH; i++) {
        code = ALPHABET.charAt(num % 62) + code;
        num = Math.floor(num / 62);
    }
    return code;
};
//# sourceMappingURL=url.code.js.map