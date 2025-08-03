export interface TournamentSuggestion {
  format: 'groups' | 'knockout' | 'league' | 'mixed'
  numberOfGroups: number
  teamsPerGroup: number
  totalMatches: number
  estimatedDuration: string
  description: string
  advantages: string[]
  disadvantages: string[]
  recommended: boolean
}

export interface TournamentConstraints {
  numberOfTeams: number
  maxDuration: string // "2h", "1d", "1w"
  availableFields: number
  maxMatchesPerDay: number
  includeThirdPlace: boolean
}

export class TournamentAI {
  static suggestFormat(constraints: TournamentConstraints): TournamentSuggestion[] {
    const { numberOfTeams, maxDuration, availableFields, maxMatchesPerDay, includeThirdPlace } = constraints
    
    const suggestions: TournamentSuggestion[] = []
    
    // Format par groupes (recommandé pour 8+ équipes)
    if (numberOfTeams >= 8) {
      const groupSuggestions = this.generateGroupSuggestions(numberOfTeams, maxDuration, maxMatchesPerDay)
      suggestions.push(...groupSuggestions)
    }
    
    // Format éliminatoire direct
    if (numberOfTeams >= 4 && numberOfTeams <= 16) {
      suggestions.push(this.generateKnockoutSuggestion(numberOfTeams, maxDuration, maxMatchesPerDay))
    }
    
    // Format championnat (toutes contre toutes)
    if (numberOfTeams <= 8) {
      suggestions.push(this.generateLeagueSuggestion(numberOfTeams, maxDuration, maxMatchesPerDay))
    }
    
    // Format mixte (groupes + éliminatoires)
    if (numberOfTeams >= 12) {
      suggestions.push(this.generateMixedSuggestion(numberOfTeams, maxDuration, maxMatchesPerDay))
    }
    
    // Marquer la meilleure suggestion
    this.markBestSuggestion(suggestions, constraints)
    
    return suggestions.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0))
  }
  
  private static generateGroupSuggestions(teams: number, maxDuration: string, maxMatchesPerDay: number): TournamentSuggestion[] {
    const suggestions: TournamentSuggestion[] = []
    
    // Suggestion 1: Groupes de 4 (optimal pour 8-16 équipes)
    if (teams % 4 === 0) {
      const groups = teams / 4
      const groupMatches = 6 // 4 équipes = 6 matchs par groupe
      const totalGroupMatches = groups * groupMatches
      const knockoutMatches = this.calculateKnockoutMatches(groups * 2)
      const totalMatches = totalGroupMatches + knockoutMatches
      
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
      })
    }
    
    // Suggestion 2: Groupes de 3 (pour 6, 9, 12, 15 équipes)
    if (teams % 3 === 0) {
      const groups = teams / 3
      const groupMatches = 3 // 3 équipes = 3 matchs par groupe
      const totalGroupMatches = groups * groupMatches
      const knockoutMatches = this.calculateKnockoutMatches(groups * 2)
      const totalMatches = totalGroupMatches + knockoutMatches
      
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
      })
    }
    
    return suggestions
  }
  
  private static generateKnockoutSuggestion(teams: number, maxDuration: string, maxMatchesPerDay: number): TournamentSuggestion {
    const totalMatches = teams - 1
    const byes = this.calculateByes(teams)
    
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
    }
  }
  
  private static generateLeagueSuggestion(teams: number, maxDuration: string, maxMatchesPerDay: number): TournamentSuggestion {
    const totalMatches = (teams * (teams - 1)) / 2
    
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
    }
  }
  
  private static generateMixedSuggestion(teams: number, maxDuration: string, maxMatchesPerDay: number): TournamentSuggestion {
    // Format: groupes + éliminatoires avec repêchage
    const groups = Math.ceil(teams / 4)
    const groupMatches = groups * 6
    const knockoutMatches = this.calculateKnockoutMatches(groups * 2) + 4 // + repêchage
    const totalMatches = groupMatches + knockoutMatches
    
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
    }
  }
  
  private static calculateKnockoutMatches(teams: number): number {
    return teams - 1
  }
  
  private static calculateByes(teams: number): number {
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(teams)))
    return nextPowerOf2 - teams
  }
  
  private static estimateDuration(matches: number, maxMatchesPerDay: number): string {
    const days = Math.ceil(matches / maxMatchesPerDay)
    if (days === 1) return '1 jour'
    if (days <= 7) return `${days} jours`
    return `${Math.ceil(days / 7)} semaines`
  }
  
  private static markBestSuggestion(suggestions: TournamentSuggestion[], constraints: TournamentConstraints): void {
    // Logique pour déterminer la meilleure suggestion
    let bestScore = 0
    let bestIndex = 0
    
    suggestions.forEach((suggestion, index) => {
      let score = 0
      
      // Score basé sur le nombre d'équipes
      if (constraints.numberOfTeams >= 8 && suggestion.format === 'groups') score += 3
      if (constraints.numberOfTeams <= 8 && suggestion.format === 'league') score += 2
      if (suggestion.format === 'knockout') score += 1
      
      // Score basé sur la durée
      if (suggestion.estimatedDuration.includes('jour') && !suggestion.estimatedDuration.includes('semaine')) score += 2
      
      // Score basé sur l'équilibre
      if (suggestion.format === 'groups' && suggestion.teamsPerGroup === 4) score += 2
      
      if (score > bestScore) {
        bestScore = score
        bestIndex = index
      }
    })
    
    suggestions[bestIndex].recommended = true
  }
  
  // Méthode pour générer des recommandations personnalisées
  static generatePersonalizedRecommendation(
    teams: number,
    venue: string,
    timeSlot: string,
    budget: number
  ): TournamentSuggestion {
    // Logique métier spécifique au contexte tunisien
    const isWeekend = timeSlot.includes('weekend') || timeSlot.includes('dimanche')
    const isEvening = timeSlot.includes('soir') || timeSlot.includes('18h')
    
    let format: 'groups' | 'knockout' | 'league' | 'mixed' = 'groups'
    let numberOfGroups = Math.ceil(teams / 4)
    
    if (teams <= 6) format = 'league'
    else if (teams <= 8 && !isWeekend) format = 'knockout'
    else if (teams >= 12) format = 'mixed'
    
    const suggestion = this.suggestFormat({
      numberOfTeams: teams,
      maxDuration: isWeekend ? '1d' : '4h',
      availableFields: 1,
      maxMatchesPerDay: isEvening ? 4 : 8,
      includeThirdPlace: true
    })[0]
    
    return {
      ...suggestion,
      description: `${suggestion.description} - Optimisé pour ${venue} (${timeSlot})`,
      advantages: [
        ...suggestion.advantages,
        `Adapté au créneau ${timeSlot}`,
        `Budget estimé: ${budget} DT`
      ]
    }
  }
} 