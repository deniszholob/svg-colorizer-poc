/** Fetches data from the specified URL.
 * @param {string} url - The URL to fetch data from.
 * @param {string} [dataType="json"] - The type of data to fetch ("json" or "text").
 * @returns {Promise<any>} - A promise that resolves with the fetched data.
 */
export function fetchData(url, dataType = "json") {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return dataType === "json" ? response.json() : response.text();
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    });
}
