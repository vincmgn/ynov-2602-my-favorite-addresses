import { map } from "../src/utils/map";

describe("manual map function", () => {
  it("should transform an array of numbers", () => {
    const input = [1, 2, 3];
    const double = (n: number) => n * 2;
    const result = map(input, double);
    expect(result).toEqual([2, 4, 6]);
  });

  it("should transform an array of strings", () => {
    const input = ["a", "b", "c"];
    const upper = (s: string) => s.toUpperCase();
    const result = map(input, upper);
    expect(result).toEqual(["A", "B", "C"]);
  });

  it("should return an empty array if input is empty", () => {
    const result = map([], (x) => x);
    expect(result).toEqual([]);
  });

  it("should not use the built-in Array.map method", () => {
    const input = [1, 2, 3];
    const mapSpy = jest.spyOn(Array.prototype, "map");
    map(input, (x) => x);
    expect(mapSpy).not.toHaveBeenCalled();
    mapSpy.mockRestore();
  });

  it("should call the callback for each item with the correct parameters", () => {
    const input = ["apple", "banana", "cherry"];
    const spyCallback = jest.fn((x) => x.toUpperCase());

    map(input, spyCallback);

    expect(spyCallback).toHaveBeenCalledTimes(input.length);

    expect(spyCallback).toHaveBeenNthCalledWith(1, "apple");
    expect(spyCallback).toHaveBeenNthCalledWith(2, "banana");
    expect(spyCallback).toHaveBeenNthCalledWith(3, "cherry");
  });
});
