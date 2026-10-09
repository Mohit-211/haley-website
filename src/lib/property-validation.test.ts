import { describe, expect, it } from "vitest";
import { toPropertyColumns, validate, type PropertyFormValues } from "./property-validation";

const empty: PropertyFormValues = { title: "", description: "", address: "", city: "", province: "", postalCode: "", price: "", type: "", beds: "", baths: "", sqft: "", lotSize: "", parking: "", yearBuilt: "", status: "Draft", image: "", gallery: "", features: "", featured: "" };
const minimal = { ...empty, title: "Riverview Bungalow", price: "289000", city: "Riverview", province: "NB" };
const NB = ["NB"];

describe("property validation", () => {
  it("accepts a listing with only the required fields", () => expect(validate(minimal, NB)).toEqual({}));
  it("requires title, price, city and province", () => expect(Object.keys(validate(empty, NB)).sort()).toEqual(["city", "price", "province", "title"]));
  it("rejects provinces that aren't active", () => expect(validate({ ...minimal, province: "ON" }, NB).province).toBeTruthy());
  it("rejects non-Canadian postal codes", () => expect(validate({ ...minimal, postalCode: "90210" }, NB).postalCode).toBeTruthy());
  it("rejects quarter bathrooms", () => expect(validate({ ...minimal, baths: "2.25" }, NB).baths).toBeTruthy());
  it("rejects a non-URL main image", () => expect(validate({ ...minimal, image: "not a url" }, NB).image).toBeTruthy());
});

describe("toPropertyColumns", () => {
  it("stores empty optional fields as null", () => {
    const c = toPropertyColumns(minimal);
    expect([c.address, c.description, c.type, c.beds, c.baths, c.sqft, c.imageUrl, c.postalCode]).toEqual([null, null, null, null, null, null, null, null]);
    expect(c.features).toEqual([]);
  });
  it("normalises postal codes and drops the main image from the gallery", () => {
    const c = toPropertyColumns({ ...minimal, postalCode: "e1c4m3", image: "https://x.ca/a.jpg", gallery: "https://x.ca/a.jpg\nhttps://x.ca/b.jpg" });
    expect(c.postalCode).toBe("E1C 4M3");
    expect(c.gallery).toEqual(["https://x.ca/b.jpg"]);
  });
});
