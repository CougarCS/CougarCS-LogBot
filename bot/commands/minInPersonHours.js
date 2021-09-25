const { safeFetch } = require("../util");
const { s } = require('../httpStatusCodes');
const { UNKNOWN_ISSUE } = require("../copy");

module.exports = {
	name: 'mininpersonhours',
    description: 'change the minimum number of hours that can be logged for in person volunteering.',
    args: true,
    usage: '<int: hours>',
    example: '2',
    useApi: true,
    superuserOnly: true,
	execute: async (message, args, config, client) => {
        const newHours = parseInt(args[0]);
        if (newHours < 1 || newHours > 24 || isNaN(newHours)) {
            await message.react('⚠️');
            await message.reply("*The argument should be a whole number between 1 and 24 (inclusive).*");
            return;
        }

        if (newHours == config.minInPersonHours) {
            await message.react('⚠️');
            await message.reply(`*The minimum hours per in person volunteering is already ${config.minInPersonHours} hour(s).*`);
            return;
        }
        
        const prevHours = newHours;
        config.minInPersonHours = newHours;

        const payload = {
            method: "UPDATE",
            body: JSON.stringify(config),
            headers: { 'Content-Type': 'application/json' }
        }

        config.minInPersonHours = prevHours;
        const [ respObj, response ] = await safeFetch(message, config, "/config", payload);
        if (!respObj && !response) return;


        if (respObj.status == s.HTTP_200_OK) {
            config.minInPersonHours = newHours;
            await message.react("✅");
            let content = `The minimum number of hours that can be logged for in person voluteering is now ${config.minInPersonHours}.`;
            await message.channel.send(content);
            return;
        }

        await message.react("⚠️");
        await message.reply(UNKNOWN_ISSUE);
        return;
	},
};