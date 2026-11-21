"""Convert AME2020 Table I and NUBASE2020 into the Liquid Drop reader's data."""
import argparse
from collections import Counter
from decimal import Decimal
import hashlib
import json
from pathlib import Path


def records(mass_path, property_path):
    properties = {}
    for line in property_path.read_text(encoding="ascii").splitlines():
        if line.startswith("#") or not line[:3].isdigit() or line[7] != "0":
            continue
        identity = int(line[:3]), int(line[4:7])
        status = line[69:78].strip()
        properties[identity] = "stable" if status == "stbl" else "other" if status else None

    masses = []
    for line in mass_path.read_text(encoding="ascii").splitlines():
        if not line[4:9].strip().isdigit() or not line[9:14].strip().isdigit():
            continue
        n, z, a = (int(line[i:i + 5]) for i in (4, 9, 14))
        if a != n + z:
            raise ValueError(f"Invalid AME2020 identity {a}, {z}")
        mass, uncertainty = line[109:123].strip(), line[123:135].strip()
        if not mass or "*" in mass:
            continue
        extrapolated = "#" in mass or "#" in uncertainty
        value = Decimal(line[106:109]) + Decimal(mass.replace("#", ".")) / 10**6
        sigma = None if not uncertainty or "*" in uncertainty else float(
            Decimal(uncertainty.replace("#", ".")) / 10**6
        )
        masses.append([a, z, line[20:23].strip(), float(value), sigma, extrapolated, properties.get((a, z))])

    if len({tuple(row[:2]) for row in masses}) != len(masses):
        raise ValueError("Duplicate AME2020 identity")
    stable = Counter((z % 2, (a - z) % 2) for (a, z), status in properties.items() if status == "stable")
    return {
        "format": 1,
        "massEdition": "AME2020",
        "propertyEdition": "NUBASE2020",
        "massSHA256": hashlib.sha256(mass_path.read_bytes()).hexdigest(),
        "propertySHA256": hashlib.sha256(property_path.read_bytes()).hexdigest(),
        "stableCounts": [stable[(0, 0)], stable[(0, 1)], stable[(1, 0)], stable[(1, 1)]],
        "rows": masses,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("ame", type=Path)
    parser.add_argument("nubase", type=Path)
    parser.add_argument("output", type=Path)
    arguments = parser.parse_args()
    result = records(arguments.ame, arguments.nubase)
    arguments.output.write_text(json.dumps(result, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f'{len(result["rows"])} AME2020 masses and {sum(result["stableCounts"])} NUBASE2020 stable ground states')
