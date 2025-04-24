import type { HLJSApi } from 'highlight.js';

export default function (hljs: HLJSApi) {
  return {
    name: 'Gherkin',
    aliases: ['feature'],
    keywords: 'Given And Then But When',
    contains: [
      // Add this new rule for the headers
      {
        className: 'keyword',
        begin: '^\\s*(Feature)',
        end: ':',
        excludeEnd: false,
        starts: {
          className: 'title',
          begin: ':\\s*',
          end: '$',
          excludeBegin: true
        }
      },
      {
        className: 'keyword',
        begin:
          '^\\s*(Background|Ability|Business Need|Scenario|Scenarios|Scenario Outline|Scenario Template|Examples)',
        end: ':',
        excludeEnd: false,
        starts: {
          className: 'section',
          begin: ':\\s*',
          end: '$',
          excludeBegin: true
        }
      },
      // Keep all your existing rules below
      {
        className: 'symbol',
        begin: '\\*',
        relevance: 0
      },
      {
        className: 'meta',
        begin: '@[^@\\s]+'
      },
      {
        begin: '\\|',
        end: '\\|\\w*$',
        contains: [
          {
            className: 'string',
            begin: '[^|]+'
          }
        ]
      },
      {
        className: 'variable',
        begin: '<',
        end: '>'
      },
      {
        className: 'variable',
        begin: '<',
        end: '>'
      },
      hljs.HASH_COMMENT_MODE,
      {
        className: 'string',
        begin: '"""',
        end: '"""'
      },
      hljs.QUOTE_STRING_MODE,
      hljs.NUMBER_MODE
    ]
  };
}
