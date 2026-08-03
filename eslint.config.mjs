import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // URL query parameters intentionally synchronize the local filter state.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    '.open-next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'assets/**',
    'jasx.me/**',
  ]),
])
