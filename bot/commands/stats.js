const { safeFetch, getDate, getUserIdFromMention, toOpenAPIDate, openAPIToDateObj } = require("../util");
const { UNKNOWN_ISSUE, USER_NOT_FOUND } = require("../copy");
const { s } = require('../httpStatusCodes');
const createLogger = require('../../logger');

const logger = createLogger(__filename);
const userMentionRegex = /^<@!?(\d+)>$/;
const sinceRegex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[1|2]\d|3[0|1])(\/(19|20)?\d\d)?$/;
const defaultDate = '2020-09-22';

module.exports = {
	name: 'stats',
    description: 'lookup cumulative number of hours/outreach done.',
    args: false,
    usage: ['', '<since?: mm/dd/yyyy>', '<user?: @mention>', '<user?: @mention> <since?: mm/dd/yyyy>', '<since?: mm/dd/yyyy> <user?: @mention>'],
    example: ['', '04/14/2022', '@Username', '@Username 04/14/2022', '04/14/2022 @Username'],
    useApi: true,
	execute: async (message, args, config, client) => {
        let mention, dateInput;

        for (let arg of args) {
            if (userMentionRegex.test(arg))
                mention = arg;
            if (sinceRegex.test(arg))
                dateInput = arg;
        }

        const discordId = mention ? getUserIdFromMention(mention) : message.author.id;
        const dateObject = dateInput ? getDate(dateInput) : openAPIToDateObj(defaultDate);
        const since = dateObject ? toOpenAPIDate(dateObject) : '2020-09-22';
        const today = new Date(new Date().toLocaleDateString());
        

        logger.info(`Mention: ${mention}`);
        logger.info(`Date Input: ${dateInput}`);
        if (dateObject >= today) {
            logger.info("dateObject >= today");
            await message.react("⚠️");
            await message.reply("The date must be prior to today.");
            return;
        }

        const payload = {
            method: "POST",
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

            logger.info(`Total Hours: ${totalHours}`);
            logger.info(`Outreach Count: ${outreachCount}`);

            const resultMessage = `volunteered a total of **${totalHours} hours** and participated in outreach **${outreachCount} ${outreachCount === 1 ? "time" : "times"}**.`;

            if (mention) {
                const user = await client.users.cache.get(discordId);
                const content = `Since ${dateObject.toLocaleDateString()}, the user ${user.username}#${user.discriminator} has ${resultMessage}`;
                await message.author.send(content);

            } else {
                const content = `Since ${dateObject.toLocaleDateString()}, you have ${resultMessage}${outreachCount || totalHours ? " Thank you!" : ""}`;
                await message.reply(content);
            }
            
            await message.react("✅");
            return;
        }

        await message.react("⚠️");
        await message.reply(UNKNOWN_ISSUE);
        return;
	},
};