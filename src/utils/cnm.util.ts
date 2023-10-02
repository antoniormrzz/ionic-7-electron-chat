const cnm = (...classNames:
  (
    string |
    { [key: string]: boolean } |
    (string | null | undefined)[] |
    undefined |
    undefined[] |
    null |
    null[]
  )[]
): string => {
  const classes = []
  for(const _className of classNames) {
    if(typeof _className === "string") {
      classes.push(_className)
    } else if(Array.isArray(_className)) {
      classes.push(..._className)
    } else if(typeof _className === "object" && _className !== null) {
      classes.push(...Object.keys(_className).filter((key) => _className[key]))
    }
  }
  return classes.filter(Boolean).join(" ")
}

export default cnm