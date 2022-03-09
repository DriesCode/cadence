import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import BaseCommand from "../api/Cadence.BaseCommand";
import EmbedHelper from "../api/Cadence.Embed";
import CadenceLavalink from "../api/Cadence.Lavalink";
import CadenceMemory from "../api/Cadence.Memory";
import Cadence from "../Cadence";

export const Command: BaseCommand = {
    name: "move",
    description: "Move one song from queue to the desired position",
    aliases: ["mv"],
    requireAdmin: false,

    run: async (interaction: CommandInteraction): Promise<void> => {
        const server = CadenceMemory.getInstance().getConnectedServer(interaction.guildId);

        if (!server) {
            interaction.reply({ embeds: [ EmbedHelper.NOK("There's nothing playing!") ], ephemeral: true });
            return;
        }

        const player = CadenceLavalink.getInstance().getPlayerByGuildId(interaction.guildId);

        if (!player) {
            interaction.reply({ embeds: [ EmbedHelper.NOK("There's nothing playing!") ], ephemeral: true });
            return;
        }

        if (!(interaction.member as GuildMember).voice?.channelId || (interaction.member as GuildMember).voice.channelId != server.voiceChannelId) {
            interaction.reply({ embeds: [ EmbedHelper.NOK("You must be connected to the same voice channel as " + Cadence.BotName + "!") ], ephemeral: true });
            return;
        }

        if (server.isQueueEmpty()) {
            interaction.reply({ embeds: [ EmbedHelper.NOK("There's nothing in the queue!") ], ephemeral: true });
            return;
        }

        let idxFrom = interaction.options.getInteger('song', true);
        let idxTo = interaction.options.getInteger('position', false);

        idxFrom--;

        if (idxTo != null)
            idxTo--;
        
        if (!server.checkIndex(idxFrom) || (!isNaN(idxTo) && idxTo != null && !server.checkIndex(idxTo))) {
            interaction.reply({ embeds: [ EmbedHelper.NOK("Please enter a valid index!") ], ephemeral: true });
            return;
        }
    
        if(isNaN(idxTo)) server.moveSong(idxFrom);
        else server.moveSong(idxFrom, idxTo);

        interaction.reply({ content: '✅' });
    },

    slashCommandBody: new SlashCommandBuilder()
                        .setName("move")
                        .setDescription("JMove one song from queue to the desired position")      
                        .addIntegerOption(o => o.setName("song").setDescription("Desired song number to move").setRequired(true).setMinValue(1))
                        .addIntegerOption(o => o.setName("position").setDescription("Desired new position for the song, [default]: next song").setRequired(false).setMinValue(1))
                        .toJSON()
}