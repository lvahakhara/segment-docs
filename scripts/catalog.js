const axios = require('axios');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

require('dotenv').config();

PLATFORM_API_URL = "https://platform.segmentapis.com"

const slugify = (displayName) => {
  let slug = displayName.toLowerCase().replace(/\s+/g, '-')
  if (slug === '.net') slug = 'net'
  if (slug === 'roku-(alpha)') slug = 'roku'
  return slug
}

const getCatalog = async (url, page_token = "") => {
  try {
   const res = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PLATFORM_API_TOKEN}`
      },
      params: {
        page_token,
        page_size: 100
      }
    });
    return res.data
  } catch (error) {
    console.log(error)
  }
}

const updateSources = async () => {
  let sources = []
  let nextPageToken = null
  while (nextPageToken !== "") {
    const res = await getCatalog(`${PLATFORM_API_URL}/v1beta/catalog/sources`, nextPageToken)
    sources = sources.concat(res.sources)
    nextPageToken = res.next_page_token
  }
  sources.sort((a, b) => {
    if(a.display_name < b.display_name) { return -1; }
    if(a.display_name > b.display_name) { return 1; }
    return 0;
  })
  const options = { noArrayIndent: true };
  let output = "# AUTOGENERATED FROM PLATFORM API. DO NOT EDIT\n"
  output += yaml.safeDump({ sections: sources }, options);
  fs.writeFileSync(path.resolve(__dirname, `../src/_data/catalog/sources.yml`), output);
}

const updateDestinations = async () => {
  let destinations = []
  let nextPageToken = null
  while (nextPageToken !== "") {
    const res = await getCatalog(`${PLATFORM_API_URL}/v1beta/catalog/destinations`, nextPageToken)
    destinations = destinations.concat(res.destinations)
    nextPageToken = res.next_page_token
  }
  destinations.sort((a, b) => {
    if(a.display_name < b.display_name) { return -1; }
    if(a.display_name > b.display_name) { return 1; }
    return 0;
  })
  const options = { noArrayIndent: true };
  let output = "# AUTOGENERATED FROM PLATFORM API. DO NOT EDIT\n"
  output += yaml.safeDump({ items: destinations }, options);
  fs.writeFileSync(path.resolve(__dirname, `../src/_data/catalog/destinations.yml`), output);
}

// Update catalog

updateSources()
updateDestinations()