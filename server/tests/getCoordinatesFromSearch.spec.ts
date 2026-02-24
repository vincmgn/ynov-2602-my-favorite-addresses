import axios from "axios";
import { getCoordinatesFromSearch } from "../src/utils/getCoordinatesFromSearch";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("getCoordinatesFromSearch", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return coordinates for a valid search word", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        features: [
          {
            geometry: {
              coordinates: [2.3522, 48.8566],
            },
          },
        ],
      },
    });

    const result = await getCoordinatesFromSearch("Paris");

    expect(result).toEqual({ lng: 2.3522, lat: 48.8566 });
    expect(mockedAxios.get).toHaveBeenCalledWith("https://data.geopf.fr/geocodage/search?q=Paris");
  });

  test("should return null if no features found", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { features: [] },
    });

    const result = await getCoordinatesFromSearch("unknown");

    expect(result).toBeNull();
  });

  test("should return null if API call fails", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

    const result = await getCoordinatesFromSearch("error");

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test("should handle missing data features", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {},
    });

    const result = await getCoordinatesFromSearch("missing");

    expect(result).toBeNull();
  });
});
