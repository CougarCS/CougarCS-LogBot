const { safeFetch, getDate, getUserIdFromMention, toOpenAPIDate } = require("../util");
const { UNKNOWN_ISSUE, USER_NOT_FOUND } = require("../copy");
const { s } = require('../httpStatusCodes');
const createLogger = require('../../logger');

const logger = createLogger(__filename);
const userMentionRegex = /^<@!?(\d+)>$/
const sinceRegex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[1|2]\d|3[0|1])(\/(19|20)?\d\d)?$/

module.exports = {
	name: 'stats',
    description: 'lookup cumulative number of hours/outreach done.',
    args: false,
    usage: ['', '<since?: mm/dd/yyyy>', '<user?: @mention>', '<user?: @mention> <since?: mm/dd/yyyy>', '<since?: mm/dd/yyyy> <user?: @mention>'],
    example: ['', '04/14/2022', '@Username', '@Username 04/14/2022', '04/14/2022 @Username'],
    useApi: true,
	execute: async (message, args, config, client) => {
        let mention, date;

        for (let arg of args) {
            if (userMentionRegex.test(arg))
                mention = arg;
            if (sinceRegex.test(arg))
                date = arg;
        }

        const discordId = mention ? getUserIdFromMention(mention) : message.author.id;
        const since = date ? toOpenAPIDate(getDate(date)) : '2020-09-22';

        const payload = {
            method: "GET",
            body: "{}",
            headers: { 'Content-Type': 'application/json' }
        }
        
        const [ respObj, response ] = await safeFetch(message, config, `/users/stats/${discordId}/${since}`, payload);
        if (!respObj && !response) return;

        if (respObj.status == s.HTTP_404_NOT_FOUND) {
            await message.react("⚠️");
            await message.author.send(USER_NOT_FOUND);
            return;
        }
        
        if (respObj.status == s.HTTP_200_OK) {
            let [ totalHours, outreachCount ] = response.body;
            totalHours = Number(Number(totalHours).toFixed(2));
            const content = `To date, you have volunteered a total of **${totalHours} hours** and participated in outreach **${outreachCount} ${outreachCount === 1 ? "time" : "times"}**. ${outreachCount || totalHours ? "Thank you!" : ""}`;
            await message.reply(content);
            await message.react("✅");
            return;
        }

        await message.react("⚠️");
        await message.reply(UNKNOWN_ISSUE);
        return;
	},
};