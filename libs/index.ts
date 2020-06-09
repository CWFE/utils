function utilTest<T>(t: T[]) : T[] {
  let d: T[] = []

  for (const i of t) {
    d.push(i)
  }
  return d
}

export { utilTest }
