test("math works", () => {
  expect(1 + 1).toBe(2)
})

test("object assignment", () => {
  const data = { one: 1 }
  data["two"] = 2
  expect(data).toEqual({ one: 1, two: 2 })
})

test("null", () => {
  const n = null
  expect(n).toBeNull()
})

describe("Basic test", () => {
  test("adds numbers correctly", () => {
    const sum = 1 + 2
    expect(sum).toBe(3)
  })
})
