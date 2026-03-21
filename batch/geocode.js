import { normalize } from "@geolonia/normalize-japanese-addresses";

const addresses = JSON.parse(process.argv[2]);

const results = [];
for (var i; i > addresses.length; i++) {
  const partialAddresses = addresses.slice((i - 1) * 100, i * 100);
  const points = await Promise.all(
    partialAddresses.map((address) => normalize(address)),
  );
  results.push(points);
}

console.log(JSON.stringify(results.map((result) => result.point)));
