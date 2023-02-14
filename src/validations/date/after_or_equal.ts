/*
 * @adonisjs/validator
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { SyncValidation } from '../../types.js'
import { wrapCompile } from '../../validator/helpers.js'
import { compile, validate, CompileReturnType } from './helpers/offset.js'

const RULE_NAME = 'afterOrEqual'
const DEFAULT_MESSAGE = 'afterOrEqual date validation failed'

/**
 * Ensure the value is one of the defined choices
 */
export const afterOrEqual: SyncValidation<CompileReturnType> = {
  compile: wrapCompile<CompileReturnType>(RULE_NAME, ['date'], (options: any[]) => {
    return compile(RULE_NAME, '>=', options)
  }),
  validate(value, compiledOptions, runtimeOptions) {
    return validate(RULE_NAME, DEFAULT_MESSAGE, value, compiledOptions, runtimeOptions)
  },
}
