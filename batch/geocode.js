import { normalize } from "@geolonia/normalize-japanese-addresses";

const addresses = JSON.parse(process.argv[2]);
const results = await Promise.all(addresses.map(normalize));
console.log(JSON.stringify(results.map((result) => result.point)));
