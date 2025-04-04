import { DeepPartial } from 'ai'
import { z } from 'zod'

export const searchSchema = z.object({
  query: z.string().describe('The query to search for'),
  max_results: z
    .number()
    .describe('The maximum number of results to return. default is 20')
    .default(20)
    .optional(),
  search_depth: z
    .literal('basic')
    .describe('The depth of the search. Only basic search is supported.')
    .default('basic')
    .optional(),
  include_domains: z
    .array(z.string())
    .describe(
      'A list of domains to specifically include in the search results. Default is None, which includes all domains.'
    )
    .default([]),
  exclude_domains: z
    .array(z.string())
    .describe(
      "A list of domains to specifically exclude from the search results. Default is None, which doesn't exclude any domains."
    )
    .default([])
})

export type PartialInquiry = DeepPartial<typeof searchSchema>
