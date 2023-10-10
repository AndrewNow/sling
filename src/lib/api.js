import { sanityClient } from "sanity:client";

export async function getQuotePost() {
  const query = `*[_type == "quote"] {
    title,
    "slug": slug.current, 
    body
  }`;
  const data = await sanityClient.fetch(query);
  return data;
}