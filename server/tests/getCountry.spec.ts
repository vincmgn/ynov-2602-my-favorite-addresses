import axios from "axios";
import { getCountriesStartingWith } from "../src/utils/getCountry";

jest.mock("axios");

describe("getCountriesStartingWith", () => {
  it("should return country starting with search", async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        data: [
          {
            name: "France",
          },
        ],
      },
    });
    const result = await getCountriesStartingWith("Fr");
    expect(result).toEqual(["France"]);
  });

  it("should return multiple countries when they match", async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        data: [{ name: "Albania" }, { name: "Algeria" }, { name: "France" }],
      },
    });

    const result = await getCountriesStartingWith("Al");
    expect(result).toEqual(["Albania", "Algeria"]);
  });

  it("should return an empty array when no country matches", async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        data: [{ name: "France" }, { name: "Belgium" }],
      },
    });

    const result = await getCountriesStartingWith("Z");
    expect(result).toEqual([]);
  });
});
