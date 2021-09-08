const { extract, convertTime, getDate, truncateString, capitalStr } = require('./util');
const { _ } = require('lodash');

const otherMinsRegex = /minutes?|mins?/i;
const otherHoursRegex = /hours?|hrs?/i;
const manySpacesRegex = / +/gi;
const mhSpaceRegex = /\s+(?=m|h)/gi;

const fields = [
    {
        labels: ["name", "n"],
        prepare(value, label) {
            return extract(label, value).trim();
        },
        validate: {
            input: [
                {
                    condition: (value) => value.length <= 100,
                    error: "The \`Name\` field should not exceed 100 characters.",
                },
                {
                    condition: (value) => !!value.match(/^[a-z0-9 ]{1,100}$/i),
                    error: "The `Name` field only accepts letters, numbers, and spaces.",
                },
            ],
            data: [],
            external: [],

        },
        process(value) {
            return value;
        },
        found: false,
        valid: true,
    },
    {
        labels: ["date", "dt"],
        prepare(value, label) {
            return extract(label, value).trim();
        },
        validate: {
            input: [
                {
                    condition: (value) => !!value.match(/\d{4}$/) ? !!value.match(/(19\d\d|20\d\d)$/g) : true,
                    error: "The \`Date\` field should be in the 20th or 21st century. (1900's or 2000's)",
                },
                {
                    condition: (value) => !!value.match(/^(0?[1-9]|1[0-2])\/(0?[1-9]|[1|2]\d|3[0|1])(\/(19|20)?\d\d)?$/g),
                    error: "The \`Date\` field accepts the following formats: \`mm/dd/yyyy\`, \`mm/dd/yy\`, \`mm/dd\`",
                },
            ],
            data: [],
            external: [],
        },
        process(value) {
            return getDate(value);
        },
        found: false,
        valid: true,
    },
    {
        labels: ["volunteer type", "v"],
        prepare(value, label) {
            return extract(label, value).trim();
        },
        validate: {
            input: [
                {
                    condition: (value) => !!value.match(/other|text|voice|group|outreach/gi),
                    error: "The \`Volunteer Type\` field should contain one of the following key words: text, voice, group, outreach, other.",
                },
            ],
            data: [],
            external: [
                // {
                //     priority: 1,
                //     condition: (labels, post) => !post.hasOwnProperty(labels[0]),
                //     error: `The \`${capitalStr(labels[0])}\` field should not be omitted.`,
                // },
            ],
        },
        process(value) {
            const words = [
                { key: !!value.match(/other/gi), weight: 1 },
                { key: !!value.match(/text/gi), weight: 2 },
                { key: !!value.match(/voice/gi), weight: 3 },
                { key: !!value.match(/group/gi), weight: 4 },
                { key: !!value.match(/outreach/gi), weight: 5 },
            ];

            let heaviest = 0;
            for (let i = 0; i < words.length; i++) {
                let { key, weight } = words[i];
                if (key) heaviest = Math.max(heaviest, weight);
            }

            switch(heaviest) {
                case 0:
                case 1:
                    return "other";
                case 2:
                    return "private text";
                case 3:
                    return "private voice";
                case 4:
                    return "group";
                case 5:
                    return "outreach";
                default:
                    return "other";
            }
        },
        found: false,
        valid: true,
    },
    {
        labels: ["duration", "dr"],
        prepare(value, label) {
            let newValue = extract(label, value).trim().toLowerCase();
	    newValue = newValue.replace(otherMinsRegex, "m");
	    newValue = newValue.replace(otherHoursRegex, "h");
	    newValue = newValue.replace(manySpacesRegex, " ");
	    newValue = newValue.replace(mhSpaceRegex, "");
            return newValue;
	    
        },
        validate: {
            input: [
                {
                    condition: (value) => {
                        const counted = _.countBy(value);
                        if (!counted.hasOwnProperty('h')) counted['h'] = 0;
                        if (!counted.hasOwnProperty('m')) counted['m'] = 0;
                        return counted['h'] <= 1 && counted['m'] <= 1;
                    },
                    error: "The `Duration` field should have no more than one `h` value or `m` value."
                },
                {
                    condition: (value) => !!value.match(/^(\d*[h|m] )?\d*[h|m]$/g),
                    error: "The \`Duration\` field requires \`Xh Ym\` format. (X and Y are whole numbers representing hours and minutes respectively)",
                },
            ],
            data: [],
            external: [],
        },
        process(value) {
            return convertTime(value);
        },
        found: false,
        valid: true,
    },
    {
        labels: ["comment", "c"],
        prepare(value, label) {
            return extract(label, value).trim();
        },
        validate: {
            input: [],
            data: [],
            external: [],
        },
        process(value) {
            return truncateString(value, 140);
        },
        found: false,
        valid: true,
    },
    {
        labels: ["outreach count", "o"],
        prepare(value, label) {
            return extract(label, value).trim();
        },
        validate: {
            input: [
                {
                    condition: (value) => !!value.match(/^\d?\d$/g),
                    error: "The `Outreach Count` field must be a 1 or 2 digit non-zero whole number.",
                },
            ],
            data: [],
            external: [],
        },
        process(value) {
            return parseInt(value);
        },
        found: false,
        valid: true,
    },
];

// Check for duplicate fields.
let arr = [];
for (let field of fields) arr = arr.concat(field.labels);
let set = new Set(arr);
if (set.size < arr.length) {
    for (let s of set) arr.splice(arr.indexOf(s), 1);
    let duplicates = Array.from(new Set(arr)).join(", ");
    throw `Duplicate field labels have been detected: ${duplicates}`;
}

// // Generate external validation.
// const externalValidation = [];
// for (let field of fields) {
//     for (let val of field.validate.external) {
//         val.labels = fields.labels;
//         if (!val.hasOwnProperty("priority")) val.priority = Infinity;
//         externalValidation.push(val);
//     }
// }

// externalValidation.sort((a, b) => a.priority - b.priority);


module.exports = {
    fields,
    // externalValidation,
}
