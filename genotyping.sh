#!/bin/bash
gluetools.sh -d -p cmd-result-format:tab -E -i project hcv module maxLikelihoodGenotyper genotype placer-result -f placements/curatedPlacement_part1.xml --detailLevel HIGH > genotyping/curatedGenotypes_part1.tsv &
gluetools.sh -d -p cmd-result-format:tab -E -i project hcv module maxLikelihoodGenotyper genotype placer-result -f placements/curatedPlacement_part2.xml --detailLevel HIGH > genotyping/curatedGenotypes_part2.tsv &
