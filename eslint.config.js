import js from '@eslint/js'
import solid from 'eslint-plugin-solid'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    {
        ignores: ['dist', 'node_modules']
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    solid.configs['flat/typescript'],
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2023,
            globals: {
                ...globals.browser,
                ...globals.node
            }
        }
    }
)
