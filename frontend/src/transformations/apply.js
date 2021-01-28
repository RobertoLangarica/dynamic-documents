import { isNumber, isNumberString } from 'class-validator'
import number_to_text from './number_to_text'

const firstLetterUppercase = (value) => {
  let split = String(value).split(' ')
  let result = ''
  split.forEach((s, index) => {
    result += s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() + (index < split.length - 1 ? ' ' : '')
  })

  return result
}

const numberTransformer = (v, transformer) => {
  let r = v
  if (isNumberString(v)) {
    r = parseFloat(v)
  }

  if (isNumber(r)) {
    return transformer(r)
  }

  return v
}
const transformations = {
  number_to_text,
  first_letter_upercase: firstLetterUppercase,
  lowercase: v => String(v).toLowerCase(),
  uppercase: v => String(v).toUpperCase(),
  ceil: v => numberTransformer(v, Math.ceil),
  round: v => numberTransformer(v, Math.round),
  floor: v => numberTransformer(v, Math.floor)
}

export default (applied, value) => {
  let result = value
  applied.forEach(t => {
    if (transformations[`${t}`]) {
      result = transformations[`${t}`](result)
    }
  })
  return result
}
