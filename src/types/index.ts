export type RoleType = {
  rank: string,
  tier: number,
}

export type RolesArraysOfStringType = {
  tank: string[],
  damage: string[],
  support: string[],
}

export type TierType = {
  rank: number,
  tier: string,
}

export type CompetitiveType ={
  tank?: TierType,
  damage?: TierType,
  support?: TierType,
}

export type ApiDataType = {
  name?: string,
  competitive?: CompetitiveType,
  error?: string,
  link?: string,
  battleTag?: string,
}

export type RoleProp = {
  tank: string,
  damage: string,
  support: string,
}

export type RemoveEmptyType = {
  error?: string,
  textContent?: string | null,
}
