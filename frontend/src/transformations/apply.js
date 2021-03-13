import { isNumber, isNumberString } from 'class-validator'
import number_to_text from './number_to_text'
import date_format from './date_format'
import format_number from './format_number'

const firstLetterUppercase = (value, params) => {
  let split = String(value).split(' ')
  let result = ''
  split.forEach((s, index) => {
    result += s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() + (index < split.length - 1 ? ' ' : '')
  })

  return result
}

export const numberTransformer = (v, transformer) => {
  let r = v
  if (isNumberString(r)) {
    r = parseFloat(v)
  }

  if (isNumber(r)) {
    return transformer(r)
  }

  return v
}

const transformations = {
  date_format,
  number_to_text,
  first_letter_upercase: firstLetterUppercase,
  lowercase: (v, params) => String(v).toLowerCase(),
  uppercase: (v, params) => String(v).toUpperCase(),
  ceil: (v, params) => numberTransformer(v, Math.ceil),
  round: (v, params) => numberTransformer(v, Math.round),
  floor: (v, params) => numberTransformer(v, Math.floor),
  number: format_number,
  percentage: format_number,
  currency: format_number
}

export default (applied, value) => {
  let result = value
  applied.forEach(t => {
    if (transformations[`${t.name}`]) {
      result = transformations[`${t.name}`](result, t.parameters)
    }
  })
  return result
}
