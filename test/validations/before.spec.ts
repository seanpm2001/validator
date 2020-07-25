/*
 * @adonisjs/validator
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { DateTime, DurationObjectUnits } from 'luxon'
import { SchemaRef, ParsedRule } from '@ioc:Adonis/Core/Validator'

import { rules } from '../../src/Rules'
// import { schema } from '../../src/Schema'
import { validate } from '../fixtures/rules/index'
import { MessagesBag } from '../../src/MessagesBag'
import { ApiErrorReporter } from '../../src/ErrorReporter'
import { before } from '../../src/Validations/date/before'

function compile(date: SchemaRef<DateTime>): ParsedRule<any>
function compile(interval: number, duration: keyof DurationObjectUnits): ParsedRule<any>
function compile(
	interval: number | SchemaRef<DateTime>,
	duration?: keyof DurationObjectUnits
): ParsedRule<any> {
	const { options } =
		typeof interval === 'number' ? rules.after(interval, duration!) : rules.after(interval)
	return before.compile('literal', 'date', options)
}

test.group('Date | Before', () => {
	validate(before, test, DateTime.local(), DateTime.local().minus({ days: 2 }), compile(1, 'day'))

	test('do not compile when one argument is passed and is not a ref', (assert) => {
		const fn = () => before.compile('literal', 'date', ['foo'])
		assert.throw(fn, '"before": expects an offset "interval" and "duration" or a "ref"')
	})

	test('do not compile when interval is not a number', (assert) => {
		const fn = () => before.compile('literal', 'date', ['foo', 'days'])
		assert.throw(fn, '"before": expects an "interval" to be a number')
	})

	test('do not compile when interval no arguments are defined', (assert) => {
		const fn = () => before.compile('literal', 'date', [])
		assert.throw(fn, '"before": expects an offset "interval" and "duration" or a "ref"')
	})
})

test.group('Date | Before | Day', () => {
	test('report error when date is not before defined interval', (assert) => {
		const reporter = new ApiErrorReporter(new MessagesBag({}), false)
		const publishedOn = DateTime.local().toISODate()

		before.validate(DateTime.fromISO(publishedOn!), compile(1, 'day').compiledOptions!, {
			errorReporter: reporter,
			field: 'published_on',
			pointer: 'published_on',
			tip: {},
			root: {},
			refs: {},
			mutate: () => {},
		})

		const errors = reporter.toJSON()
		assert.lengthOf(errors.errors, 1)
		assert.equal(errors.errors[0].field, 'published_on')
		assert.equal(errors.errors[0].rule, 'before')
		assert.equal(errors.errors[0].message, 'before date validation failed')
	})

	/**
	 * The time should have no relevance in case of `days` offset
	 */
	test('report error when datetime is not before defined interval', (assert) => {
		const reporter = new ApiErrorReporter(new MessagesBag({}), false)
		const publishedOn = DateTime.local().minus({ days: 1 }).toISO()

		before.validate(DateTime.fromISO(publishedOn!), compile(1, 'day').compiledOptions!, {
			errorReporter: reporter,
			field: 'published_on',
			pointer: 'published_on',
			tip: {},
			root: {},
			refs: {},
			mutate: () => {},
		})

		const errors = reporter.toJSON()
		assert.lengthOf(errors.errors, 1)
		assert.equal(errors.errors[0].field, 'published_on')
		assert.equal(errors.errors[0].rule, 'before')
		assert.equal(errors.errors[0].message, 'before date validation failed')
	})

	test('work fine when date is before defined interval', (assert) => {
		const reporter = new ApiErrorReporter(new MessagesBag({}), false)
		const publishedOn = DateTime.local().minus({ days: 2 }).toISO()

		before.validate(DateTime.fromISO(publishedOn!), compile(1, 'day').compiledOptions!, {
			errorReporter: reporter,
			field: 'published_on',
			pointer: 'published_on',
			tip: {},
			root: {},
			refs: {},
			mutate: () => {},
		})

		const errors = reporter.toJSON()
		assert.lengthOf(errors.errors, 0)
	})
})

test.group('Date | Before | Minutes', () => {
	test('work fine when time is not defined for the same day', (assert) => {
		const reporter = new ApiErrorReporter(new MessagesBag({}), false)
		const publishedAt = DateTime.local().toISODate()

		before.validate(DateTime.fromISO(publishedAt!), compile(30, 'minutes').compiledOptions!, {
			errorReporter: reporter,
			field: 'published_at',
			pointer: 'published_at',
			tip: {},
			root: {},
			refs: {},
			mutate: () => {},
		})

		const errors = reporter.toJSON()
		assert.lengthOf(errors.errors, 0)
	})

	test('report error when time is not before the defined interval', (assert) => {
		const reporter = new ApiErrorReporter(new MessagesBag({}), false)
		const publishedAt = DateTime.local().toISO()

		before.validate(DateTime.fromISO(publishedAt!), compile(30, 'minutes').compiledOptions!, {
			errorReporter: reporter,
			field: 'published_at',
			pointer: 'published_at',
			tip: {},
			root: {},
			refs: {},
			mutate: () => {},
		})

		const errors = reporter.toJSON()
		assert.lengthOf(errors.errors, 1)
		assert.equal(errors.errors[0].field, 'published_at')
		assert.equal(errors.errors[0].rule, 'before')
		assert.equal(errors.errors[0].message, 'before date validation failed')
	})

	test('work fine when time is before the defined interval', (assert) => {
		const reporter = new ApiErrorReporter(new MessagesBag({}), false)
		const publishedAt = DateTime.local().minus({ minutes: 40 }).toISO()

		before.validate(DateTime.fromISO(publishedAt!), compile(30, 'minutes').compiledOptions!, {
			errorReporter: reporter,
			field: 'published_at',
			pointer: 'published_at',
			tip: {},
			root: {},
			refs: {},
			mutate: () => {},
		})

		const errors = reporter.toJSON()
		assert.lengthOf(errors.errors, 0)
	})

	test('work fine when time is not defined for yesterday', (assert) => {
		const reporter = new ApiErrorReporter(new MessagesBag({}), false)
		const publishedAt = DateTime.local().minus({ days: 1 }).toISODate()

		before.validate(DateTime.fromISO(publishedAt!), compile(30, 'minutes').compiledOptions!, {
			errorReporter: reporter,
			field: 'published_at',
			pointer: 'published_at',
			tip: {},
			root: {},
			refs: {},
			mutate: () => {},
		})

		const errors = reporter.toJSON()
		assert.lengthOf(errors.errors, 0)
	})
})

// test.group('Date | After | Ref', () => {
// 	test('report error when date is before the defined ref', (assert) => {
// 		const reporter = new ApiErrorReporter(new MessagesBag({}), false)
// 		const publishedAt = DateTime.local().toISODate()
// 		const validator = {
// 			errorReporter: reporter,
// 			field: 'published_at',
// 			pointer: 'published_at',
// 			tip: {},
// 			root: {},
// 			refs: schema.refs({
// 				afterDate: DateTime.local().plus({ days: 10 }),
// 			}),
// 			mutate: () => {},
// 		}

// 		after.validate(
// 			DateTime.fromISO(publishedAt!),
// 			compile(validator.refs.afterDate).compiledOptions!,
// 			validator
// 		)

// 		const errors = reporter.toJSON()
// 		assert.lengthOf(errors.errors, 1)
// 		assert.equal(errors.errors[0].field, 'published_at')
// 		assert.equal(errors.errors[0].rule, 'after')
// 		assert.equal(errors.errors[0].message, 'after date validation failed')
// 	})

// 	test('report error when datetime is before the defined ref', (assert) => {
// 		const reporter = new ApiErrorReporter(new MessagesBag({}), false)
// 		const publishedAt = DateTime.local().toISO()

// 		const validator = {
// 			errorReporter: reporter,
// 			field: 'published_at',
// 			pointer: 'published_at',
// 			tip: {},
// 			root: {},
// 			refs: schema.refs({
// 				afterDate: DateTime.local().plus({ minutes: 30 }),
// 			}),
// 			mutate: () => {},
// 		}

// 		after.validate(
// 			DateTime.fromISO(publishedAt!),
// 			compile(validator.refs.afterDate).compiledOptions!,
// 			validator
// 		)

// 		const errors = reporter.toJSON()
// 		assert.lengthOf(errors.errors, 1)
// 		assert.equal(errors.errors[0].field, 'published_at')
// 		assert.equal(errors.errors[0].rule, 'after')
// 		assert.equal(errors.errors[0].message, 'after date validation failed')
// 	})

// 	test('report error when time is not defined for the same day', (assert) => {
// 		const reporter = new ApiErrorReporter(new MessagesBag({}), false)
// 		const publishedAt = DateTime.local().plus({ minutes: 30 }).toISODate()
// 		const validator = {
// 			errorReporter: reporter,
// 			field: 'published_at',
// 			pointer: 'published_at',
// 			tip: {},
// 			root: {},
// 			refs: schema.refs({
// 				afterDate: DateTime.local().plus({ minutes: 10 }),
// 			}),
// 			mutate: () => {},
// 		}

// 		after.validate(
// 			DateTime.fromISO(publishedAt!),
// 			compile(validator.refs.afterDate).compiledOptions!,
// 			validator
// 		)

// 		const errors = reporter.toJSON()
// 		assert.lengthOf(errors.errors, 1)
// 		assert.equal(errors.errors[0].field, 'published_at')
// 		assert.equal(errors.errors[0].rule, 'after')
// 		assert.equal(errors.errors[0].message, 'after date validation failed')
// 	})

// 	test('work fine when date is after the defined ref', (assert) => {
// 		const reporter = new ApiErrorReporter(new MessagesBag({}), false)
// 		const publishedAt = DateTime.local().plus({ days: 11 }).toISODate()
// 		const validator = {
// 			errorReporter: reporter,
// 			field: 'published_at',
// 			pointer: 'published_at',
// 			tip: {},
// 			root: {},
// 			refs: schema.refs({
// 				afterDate: DateTime.local().plus({ days: 10 }),
// 			}),
// 			mutate: () => {},
// 		}

// 		after.validate(
// 			DateTime.fromISO(publishedAt!),
// 			compile(validator.refs.afterDate).compiledOptions!,
// 			validator
// 		)

// 		const errors = reporter.toJSON()
// 		assert.lengthOf(errors.errors, 0)
// 	})

// 	test('work fine when datetime is after the defined ref', (assert) => {
// 		const reporter = new ApiErrorReporter(new MessagesBag({}), false)
// 		const publishedAt = DateTime.local().plus({ minutes: 30 }).toISO()
// 		const validator = {
// 			errorReporter: reporter,
// 			field: 'published_at',
// 			pointer: 'published_at',
// 			tip: {},
// 			root: {},
// 			refs: schema.refs({
// 				afterDate: DateTime.local().plus({ minutes: 10 }),
// 			}),
// 			mutate: () => {},
// 		}

// 		after.validate(
// 			DateTime.fromISO(publishedAt!),
// 			compile(validator.refs.afterDate).compiledOptions!,
// 			validator
// 		)

// 		const errors = reporter.toJSON()
// 		assert.lengthOf(errors.errors, 0)
// 	})

// 	test('work fine when time is not defined for the next day', (assert) => {
// 		const reporter = new ApiErrorReporter(new MessagesBag({}), false)
// 		const publishedAt = DateTime.local().plus({ days: 1 }).toISODate()
// 		const validator = {
// 			errorReporter: reporter,
// 			field: 'published_at',
// 			pointer: 'published_at',
// 			tip: {},
// 			root: {},
// 			refs: schema.refs({
// 				afterDate: DateTime.local().plus({ minutes: 10 }),
// 			}),
// 			mutate: () => {},
// 		}

// 		after.validate(
// 			DateTime.fromISO(publishedAt!),
// 			compile(validator.refs.afterDate).compiledOptions!,
// 			validator
// 		)

// 		const errors = reporter.toJSON()
// 		assert.lengthOf(errors.errors, 0)
// 	})
// })
