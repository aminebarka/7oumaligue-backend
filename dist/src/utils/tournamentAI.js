"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentAI = void 0;
class TournamentAI {
    static suggestFormat(constraints) {
        const { numberOfTeams, maxDuration, availableFields, maxMatchesPerDay, includeThirdPlace } = constraints;
        const suggestions = [];
        if (numberOfTeams >= 8) {
            const groupSuggestions = this.generateGroupSuggestions(numberOfTeams, maxDuration, maxMatchesPerDay);
            suggestions.push(...groupSuggestions);
        }
        if (numberOfTeams >= 4 && numberOfTeams <= 16) {
            suggestions.push(this.generateKnockoutSuggestion(numberOfTeams, maxDuration, maxMatchesPerDay));
        }
        if (numberOfTeams <= 8) {
            suggestions.push(this.generateLeagueSuggestion(numberOfTeams, maxDuration, maxMatchesPerDay));
        }
        if (numberOfTeams >= 12) {
            suggestions.push(this.generateMixedSuggestion(numberOfTeams, maxDuration, maxMatchesPerDay));
        }
        this.markBestSuggestion(suggestions, constraints);
        return suggestions.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));
    }
    static generateGroupSuggestions(teams, maxDuration, maxMatchesPerDay) {
        const suggestions = [];
        if (teams % 4 === 0) {
            const groups = teams / 4;
            const groupMatches = 6;
            const totalGroupMatches = groups * groupMatches;
            const knockoutMatches = this.calculateKnockoutMatches(groups * 2);
            const totalMatches = totalGroupMatches + knockoutMatches;
            suggestions.push({
                format: 'groups',
                numberOfGroups: groups,
                teamsPerGroup: 4,
                totalMatches,
                estimatedDuration: this.estimateDuration(totalMatches, maxMatchesPerDay),
                description: `${groups} groupes de 4 équipes, phase de groupes + éliminatoires`,
                advantages: [
                    'Équilibre parfait entre équipes',
                    'Chaque équipe joue 3 matchs minimum',
                    'Format standard et reconnu',
                    'Possibilité de qualifier les meilleurs 3èmes'
                ],
                disadvantages: [
                    'Plus de matchs à organiser',
                    'Nécessite plus de temps'
                ],
                recommended: false
            });
        }
        if (teams % 3 === 0) {
            const groups = teams / 3;
            const groupMatches = 3;
            const totalGroupMatches = groups * groupMatches;
            const knockoutMatches = this.calculateKnockoutMatches(groups * 2);
            const totalMatches = totalGroupMatches + knockoutMatches;
            suggestions.push({
                format: 'groups',
                numberOfGroups: groups,
                teamsPerGroup: 3,
                totalMatches,
                estimatedDuration: this.estimateDuration(totalMatches, maxMatchesPerDay),
                description: `${groups} groupes de 3 équipes, phase de groupes + éliminatoires`,
                advantages: [
                    'Format rapide et efficace',
                    'Peu de matchs par équipe',
                    'Idéal pour les tournois courts'
                ],
                disadvantages: [
                    'Moins d\'équilibre entre groupes',
                    'Risque de qualification par différence de buts'
                ],
                recommended: false
            });
        }
        return suggestions;
    }
    static generateKnockoutSuggestion(teams, maxDuration, maxMatchesPerDay) {
        const totalMatches = teams - 1;
        const byes = this.calculateByes(teams);
        return {
            format: 'knockout',
            numberOfGroups: 0,
            teamsPerGroup: 0,
            totalMatches,
            estimatedDuration: this.estimateDuration(totalMatches, maxMatchesPerDay),
            description: `Éliminatoire direct${byes > 0 ? ` avec ${byes} équipes exemptées` : ''}`,
            advantages: [
                'Format le plus rapide',
                'Suspense maximal',
                'Peu de matchs à organiser'
            ],
            disadvantages: [
                'Équipes éliminées rapidement',
                'Pas de deuxième chance',
                'Dépendant du tirage au sort'
            ],
            recommended: false
        };
    }
    static generateLeagueSuggestion(teams, maxDuration, maxMatchesPerDay) {
        const totalMatches = (teams * (teams - 1)) / 2;
        return {
            format: 'league',
            numberOfGroups: 1,
            teamsPerGroup: teams,
            totalMatches,
            estimatedDuration: this.estimateDuration(totalMatches, maxMatchesPerDay),
            description: 'Championnat toutes contre toutes',
            advantages: [
                'Format le plus équitable',
                'Chaque équipe joue contre toutes les autres',
                'Classement final représentatif'
            ],
            disadvantages: [
                'Beaucoup de matchs',
                'Nécessite beaucoup de temps',
                'Peut être monotone'
            ],
            recommended: false
        };
    }
    static generateMixedSuggestion(teams, maxDuration, maxMatchesPerDay) {
        const groups = Math.ceil(teams / 4);
        const groupMatches = groups * 6;
        const knockoutMatches = this.calculateKnockoutMatches(groups * 2) + 4;
        const totalMatches = groupMatches + knockoutMatches;
        return {
            format: 'mixed',
            numberOfGroups: groups,
            teamsPerGroup: Math.ceil(teams / groups),
            totalMatches,
            estimatedDuration: this.estimateDuration(totalMatches, maxMatchesPerDay),
            description: 'Groupes + éliminatoires avec repêchage',
            advantages: [
                'Format équilibré',
                'Donne une deuxième chance',
                'Plus de matchs pour les meilleures équipes'
            ],
            disadvantages: [
                'Complexe à organiser',
                'Beaucoup de matchs'
            ],
            recommended: false
        };
    }
    static calculateKnockoutMatches(teams) {
        return teams - 1;
    }
    static calculateByes(teams) {
        const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(teams)));
        return nextPowerOf2 - teams;
    }
    static estimateDuration(matches, maxMatchesPerDay) {
        const days = Math.ceil(matches / maxMatchesPerDay);
        if (days === 1)
            return '1 jour';
        if (days <= 7)
            return `${days} jours`;
        return `${Math.ceil(days / 7)} semaines`;
    }
    static markBestSuggestion(suggestions, constraints) {
        let bestScore = 0;
        let bestIndex = 0;
        suggestions.forEach((suggestion, index) => {
            let score = 0;
            if (constraints.numberOfTeams >= 8 && suggestion.format === 'groups')
                score += 3;
            if (constraints.numberOfTeams <= 8 && suggestion.format === 'league')
                score += 2;
            if (suggestion.format === 'knockout')
                score += 1;
            if (suggestion.estimatedDuration.includes('jour') && !suggestion.estimatedDuration.includes('semaine'))
                score += 2;
            if (suggestion.format === 'groups' && suggestion.teamsPerGroup === 4)
                score += 2;
            if (score > bestScore) {
                bestScore = score;
                bestIndex = index;
            }
        });
        suggestions[bestIndex].recommended = true;
    }
    static generatePersonalizedRecommendation(teams, venue, timeSlot, budget) {
        const isWeekend = timeSlot.includes('weekend') || timeSlot.includes('dimanche');
        const isEvening = timeSlot.includes('soir') || timeSlot.includes('18h');
        let format = 'groups';
        let numberOfGroups = Math.ceil(teams / 4);
        if (teams <= 6)
            format = 'league';
        else if (teams <= 8 && !isWeekend)
            format = 'knockout';
        else if (teams >= 12)
            format = 'mixed';
        const suggestion = this.suggestFormat({
            numberOfTeams: teams,
            maxDuration: isWeekend ? '1d' : '4h',
            availableFields: 1,
            maxMatchesPerDay: isEvening ? 4 : 8,
            includeThirdPlace: true
        })[0];
        return {
            ...suggestion,
            description: `${suggestion.description} - Optimisé pour ${venue} (${timeSlot})`,
            advantages: [
                ...suggestion.advantages,
                `Adapté au créneau ${timeSlot}`,
                `Budget estimé: ${budget} DT`
            ]
        };
    }
}
exports.TournamentAI = TournamentAI;
//# sourceMappingURL=tournamentAI.js.map