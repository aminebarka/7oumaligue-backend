import { createCanvas, loadImage, registerFont } from 'canvas'
import path from 'path'

interface PlayerCardData {
  player: any
  stats: any
  averageRating: number
  reputationLevel: string
  badges: any[]
}

// Enregistrer les polices (optionnel)
try {
  registerFont(path.join(__dirname, '../assets/fonts/Roboto-Bold.ttf'), { family: 'Roboto-Bold' })
  registerFont(path.join(__dirname, '../assets/fonts/Roboto-Regular.ttf'), { family: 'Roboto-Regular' })
} catch (error) {
  console.log('Polices non trouvées, utilisation des polices par défaut')
}

export async function generatePlayerCard(data: PlayerCardData): Promise<Buffer> {
  const { player, stats, averageRating, reputationLevel, badges } = data

  // Créer un canvas de 400x600 pixels (format carte Panini)
  const canvas = createCanvas(400, 600)
  const ctx = canvas.getContext('2d')

  // Couleurs et styles
  const colors = {
    background: getReputationColor(reputationLevel),
    text: '#FFFFFF',
    accent: '#FFD700',
    secondary: '#CCCCCC'
  }

  // Fond avec dégradé
  const gradient = ctx.createLinearGradient(0, 0, 0, 600)
  gradient.addColorStop(0, colors.background)
  gradient.addColorStop(1, darkenColor(colors.background, 0.3))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 400, 600)

  // En-tête de la carte
  drawCardHeader(ctx, player, reputationLevel, colors)
  
  // Photo du joueur (placeholder)
  drawPlayerPhoto(ctx, player, colors)
  
  // Informations du joueur
  drawPlayerInfo(ctx, player, colors)
  
  // Statistiques
  drawPlayerStats(ctx, stats, averageRating, colors)
  
  // Badges
  drawPlayerBadges(ctx, badges, colors)
  
  // Pied de carte
  drawCardFooter(ctx, colors)

  return canvas.toBuffer('image/png')
}

function drawCardHeader(ctx: any, player: any, reputationLevel: string, colors: any) {
  // Logo de l'équipe
  ctx.fillStyle = colors.accent
  ctx.font = 'bold 48px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(player.team?.logo || '⚽', 200, 60)

  // Nom du joueur
  ctx.fillStyle = colors.text
  ctx.font = 'bold 24px Arial'
  ctx.fillText(player.name, 200, 100)

  // Position et niveau
  ctx.font = '16px Arial'
  ctx.fillStyle = colors.secondary
  ctx.fillText(`${player.position} • Niveau ${reputationLevel}`, 200, 125)
}

function drawPlayerPhoto(ctx: any, player: any, colors: any) {
  // Cercle pour la photo
  ctx.beginPath()
  ctx.arc(200, 200, 60, 0, 2 * Math.PI)
  ctx.fillStyle = colors.accent
  ctx.fill()

  // Placeholder pour la photo
  ctx.fillStyle = colors.text
  ctx.font = 'bold 48px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(player.team?.logo || '⚽', 200, 210)
}

function drawPlayerInfo(ctx: any, player: any, colors: any) {
  const infoY = 300

  // Âge
  ctx.fillStyle = colors.text
  ctx.font = '16px Arial'
  ctx.textAlign = 'left'
  ctx.fillText(`Âge: ${player.age} ans`, 50, infoY)

  // Numéro de maillot
  ctx.textAlign = 'right'
  ctx.fillText(`N°${player.jerseyNumber || '?'}`, 350, infoY)

  // Équipe
  ctx.textAlign = 'center'
  ctx.fillText(player.team?.name || 'Équipe libre', 200, infoY + 25)
}

function drawPlayerStats(ctx: any, stats: any, averageRating: number, colors: any) {
  const statsY = 350
  const statSpacing = 80

  // Titre des statistiques
  ctx.fillStyle = colors.accent
  ctx.font = 'bold 18px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('STATISTIQUES', 200, statsY)

  // Grille des stats
  const statData = [
    { label: 'Buts', value: stats.goals, color: '#FF6B6B' },
    { label: 'Passes', value: stats.assists, color: '#4ECDC4' },
    { label: 'Matchs', value: stats.matches, color: '#45B7D1' },
    { label: 'Note', value: Math.round(averageRating * 10) / 10, color: '#96CEB4' }
  ]

  statData.forEach((stat, index) => {
    const x = 100 + (index % 2) * 200
    const y = statsY + 40 + Math.floor(index / 2) * 60

    // Cercle de fond
    ctx.beginPath()
    ctx.arc(x, y, 25, 0, 2 * Math.PI)
    ctx.fillStyle = stat.color
    ctx.fill()

    // Valeur
    ctx.fillStyle = colors.text
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(stat.value.toString(), x, y + 5)

    // Label
    ctx.font = '12px Arial'
    ctx.fillStyle = colors.secondary
    ctx.fillText(stat.label, x, y + 25)
  })
}

function drawPlayerBadges(ctx: any, badges: any[], colors: any) {
  const badgesY = 520
  const maxBadges = 4

  // Titre
  ctx.fillStyle = colors.accent
  ctx.font = 'bold 16px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('BADGES', 200, badgesY)

  // Afficher les badges (max 4)
  const badgesToShow = badges.slice(0, maxBadges)
  const badgeSpacing = 80

  badgesToShow.forEach((badge, index) => {
    const x = 100 + index * badgeSpacing

    // Cercle du badge
    ctx.beginPath()
    ctx.arc(x, badgesY + 20, 20, 0, 2 * Math.PI)
    ctx.fillStyle = colors.accent
    ctx.fill()

    // Icône du badge
    ctx.fillStyle = colors.text
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(badge.icon, x, badgesY + 25)
  })
}

function drawCardFooter(ctx: any, colors: any) {
  // Logo 7ouma Ligue
  ctx.fillStyle = colors.accent
  ctx.font = 'bold 14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('7OUMA LIGUE', 200, 580)

  // Ligne décorative
  ctx.strokeStyle = colors.accent
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(50, 570)
  ctx.lineTo(350, 570)
  ctx.stroke()
}

function getReputationColor(reputationLevel: string): string {
  const colors = {
    'Débutant': '#4A90E2',
    'Intermédiaire': '#50C878',
    'Avancé': '#FFD700',
    'Professionnel': '#FF6B35',
    'Expert': '#9B59B6',
    'Légende': '#E74C3C'
  }
  return colors[reputationLevel as keyof typeof colors] || '#4A90E2'
}

function darkenColor(color: string, factor: number): string {
  // Conversion hex vers RGB
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  // Assombrir
  const newR = Math.floor(r * (1 - factor))
  const newG = Math.floor(g * (1 - factor))
  const newB = Math.floor(b * (1 - factor))

  // Conversion RGB vers hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

// Fonction pour générer une carte SVG (alternative)
export function generatePlayerCardSVG(data: PlayerCardData): string {
  const { player, stats, averageRating, reputationLevel, badges } = data
  const colors = {
    background: getReputationColor(reputationLevel),
    text: '#FFFFFF',
    accent: '#FFD700',
    secondary: '#CCCCCC'
  }

  return `
<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.background};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${darkenColor(colors.background, 0.3)};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fond -->
  <rect width="400" height="600" fill="url(#bg)"/>
  
  <!-- En-tête -->
  <text x="200" y="60" text-anchor="middle" fill="${colors.accent}" font-family="Arial" font-size="48" font-weight="bold">
    ${player.team?.logo || '⚽'}
  </text>
  
  <text x="200" y="100" text-anchor="middle" fill="${colors.text}" font-family="Arial" font-size="24" font-weight="bold">
    ${player.name}
  </text>
  
  <text x="200" y="125" text-anchor="middle" fill="${colors.secondary}" font-family="Arial" font-size="16">
    ${player.position} • Niveau ${reputationLevel}
  </text>
  
  <!-- Photo -->
  <circle cx="200" cy="200" r="60" fill="${colors.accent}"/>
  <text x="200" y="210" text-anchor="middle" fill="${colors.text}" font-family="Arial" font-size="48" font-weight="bold">
    ${player.team?.logo || '⚽'}
  </text>
  
  <!-- Informations -->
  <text x="50" y="300" fill="${colors.text}" font-family="Arial" font-size="16">
    Âge: ${player.age} ans
  </text>
  
  <text x="350" y="300" text-anchor="end" fill="${colors.text}" font-family="Arial" font-size="16">
    N°${player.jerseyNumber || '?'}
  </text>
  
  <text x="200" y="325" text-anchor="middle" fill="${colors.text}" font-family="Arial" font-size="16">
    ${player.team?.name || 'Équipe libre'}
  </text>
  
  <!-- Statistiques -->
  <text x="200" y="350" text-anchor="middle" fill="${colors.accent}" font-family="Arial" font-size="18" font-weight="bold">
    STATISTIQUES
  </text>
  
  <!-- Stats en grille -->
  <circle cx="100" cy="390" r="25" fill="#FF6B6B"/>
  <text x="100" y="395" text-anchor="middle" fill="${colors.text}" font-family="Arial" font-size="16" font-weight="bold">
    ${stats.goals}
  </text>
  <text x="100" y="415" text-anchor="middle" fill="${colors.secondary}" font-family="Arial" font-size="12">
    Buts
  </text>
  
  <circle cx="300" cy="390" r="25" fill="#4ECDC4"/>
  <text x="300" y="395" text-anchor="middle" fill="${colors.text}" font-family="Arial" font-size="16" font-weight="bold">
    ${stats.assists}
  </text>
  <text x="300" y="415" text-anchor="middle" fill="${colors.secondary}" font-family="Arial" font-size="12">
    Passes
  </text>
  
  <circle cx="100" cy="450" r="25" fill="#45B7D1"/>
  <text x="100" y="455" text-anchor="middle" fill="${colors.text}" font-family="Arial" font-size="16" font-weight="bold">
    ${stats.matches}
  </text>
  <text x="100" y="475" text-anchor="middle" fill="${colors.secondary}" font-family="Arial" font-size="12">
    Matchs
  </text>
  
  <circle cx="300" cy="450" r="25" fill="#96CEB4"/>
  <text x="300" y="455" text-anchor="middle" fill="${colors.text}" font-family="Arial" font-size="16" font-weight="bold">
    ${Math.round(averageRating * 10) / 10}
  </text>
  <text x="300" y="475" text-anchor="middle" fill="${colors.secondary}" font-family="Arial" font-size="12">
    Note
  </text>
  
  <!-- Badges -->
  <text x="200" y="520" text-anchor="middle" fill="${colors.accent}" font-family="Arial" font-size="16" font-weight="bold">
    BADGES
  </text>
  
  ${badges.slice(0, 4).map((badge, index) => `
    <circle cx="${100 + index * 80}" cy="540" r="20" fill="${colors.accent}"/>
    <text x="${100 + index * 80}" y="545" text-anchor="middle" fill="${colors.text}" font-family="Arial" font-size="16">
      ${badge.icon}
    </text>
  `).join('')}
  
  <!-- Pied de carte -->
  <line x1="50" y1="570" x2="350" y2="570" stroke="${colors.accent}" stroke-width="2"/>
  <text x="200" y="580" text-anchor="middle" fill="${colors.accent}" font-family="Arial" font-size="14" font-weight="bold">
    7OUMA LIGUE
  </text>
</svg>
  `
} 