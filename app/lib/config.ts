/**
 * Application configuration for PersonalCRM
 * Contains excluded entities that should not be processed as contacts or organizations
 */

// Team member configuration - these are people who are part of our team
// and should not be created as contacts when parsing input text
export const TEAM_MEMBERS = [
  {
    name: 'Ravikant Agrawal',
    aliases: [
      'ravi',
      'ravikant',
      'ravi agrawal',
      'ravikant agrawal',
      '@ravidilse',
      'ravidilse',
      'ravi@privado.id',
      'ravi@billions.network',
    ],
  },
] as const

// Company configuration - our own company that should not be created
// as an organization or considered as a project/partner
export const OWN_COMPANY = {
  name: 'Billions',
  aliases: [
    'billions',
    '@billions_ntwk',
    'billions_ntwk',
    'billions network',
    '@billions',
    'billions.network',
    'privado.id',
    'privado',
  ],
} as const

// Helper function to check if a name matches a team member
export function isTeamMember(name: string): boolean {
  const normalized = name.toLowerCase().trim()
  
  for (const member of TEAM_MEMBERS) {
    if (member.name.toLowerCase() === normalized) return true
    if (member.aliases.some(alias => alias.toLowerCase() === normalized)) return true
  }
  
  return false
}

// Helper function to check if an organization name matches our own company
export function isOwnCompany(name: string): boolean {
  const normalized = name.toLowerCase().trim()
  
  if (OWN_COMPANY.name.toLowerCase() === normalized) return true
  if (OWN_COMPANY.aliases.some(alias => alias.toLowerCase() === normalized)) return true
  
  return false
}

// Helper function to check if a text contains team member references
export function containsTeamMemberReference(text: string): string | null {
  const normalized = text.toLowerCase()
  
  for (const member of TEAM_MEMBERS) {
    if (normalized.includes(member.name.toLowerCase())) return member.name
    for (const alias of member.aliases) {
      if (normalized.includes(alias.toLowerCase())) return member.name
    }
  }
  
  return null
}

// Helper function to check if a text contains own company references
export function containsOwnCompanyReference(text: string): string | null {
  const normalized = text.toLowerCase()
  
  if (normalized.includes(OWN_COMPANY.name.toLowerCase())) return OWN_COMPANY.name
  for (const alias of OWN_COMPANY.aliases) {
    if (normalized.includes(alias.toLowerCase())) return OWN_COMPANY.name
  }
  
  return null
}

// Export all excluded entity names for quick reference
export const EXCLUDED_CONTACT_NAMES = TEAM_MEMBERS.flatMap(m => [m.name, ...m.aliases])
export const EXCLUDED_ORG_NAMES = [OWN_COMPANY.name, ...OWN_COMPANY.aliases]
