export const isParserError = r => 'object' == typeof r && null !== r && '_errid' in r
